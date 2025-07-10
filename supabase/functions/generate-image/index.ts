import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper function to pause execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// These environment variables are automatically provided by Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// These secrets must be set in the Supabase project's Function settings
const azureApiKey = Deno.env.get("AZURE_AI_API_KEY");
const azureEndpoint = Deno.env.get("AZURE_AI_ENDPOINT");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check for Azure service configuration
    if (!azureApiKey || !azureEndpoint) {
      console.error("Azure AI environment variables are not set.");
      return new Response(JSON.stringify({ error: "AI service is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Authenticate the user
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get the prompt from the request body
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check and decrement user credits
    const { data: creditsDecremented, error: creditsError } = await supabaseAdmin.rpc('decrement_credits', {
      user_id_input: user.id,
      amount: 1
    });

    if (creditsError || !creditsDecremented) {
      return new Response(JSON.stringify({ error: "Insufficient credits or database error." }), {
        status: 402, // Payment Required
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Call Azure AI to generate the image (asynchronous flow)
    // The DALL-E 3 API is async. We first request the generation, then poll for the result.
    const deploymentId = "DALL-E-3";
    const apiVersion = "2024-02-01";
    const initialUrl = `${azureEndpoint}/openai/deployments/${deploymentId}/images/generations?api-version=${apiVersion}`;

    const initialResponse = await fetch(initialUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": azureApiKey },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "1792x1024", // High-resolution landscape format
        quality: "hd",
        style: "vivid",
      }),
    });

    if (initialResponse.status !== 202) {
      const errorBody = await initialResponse.json();
      console.error("Azure AI initial request failed:", errorBody);
      // TODO: In a production app, refund the credit here.
      return new Response(JSON.stringify({ error: "Failed to start image generation." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const operationLocation = initialResponse.headers.get("operation-location");
    if (!operationLocation) {
      // TODO: Refund credit
      return new Response(JSON.stringify({ error: "Invalid response from AI service." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll for the result
    let generatedImageUrl = "";
    const maxRetries = 20; // ~60 seconds timeout
    for (let i = 0; i < maxRetries; i++) {
      await sleep(3000); // Wait 3 seconds between polls

      const pollResponse = await fetch(operationLocation, { headers: { "api-key": azureApiKey } });
      if (!pollResponse.ok) continue; // Ignore transient errors and retry

      const pollResult = await pollResponse.json();
      if (pollResult.status === "succeeded") {
        generatedImageUrl = pollResult.result.data[0].url;
        break;
      } else if (pollResult.status === "failed") {
        console.error("Azure AI generation failed:", pollResult.error);
        // TODO: Refund credit
        return new Response(JSON.stringify({ error: "AI generation failed. Your prompt may violate content policies." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // If status is "running" or "notStarted", the loop continues
    }

    if (!generatedImageUrl) {
      // TODO: Refund credit
      return new Response(JSON.stringify({ error: "Image generation timed out." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Save the generated image record to the database
    const { data: imageRecord, error: insertError } = await supabaseAdmin
      .from("images")
      .insert({ user_id: user.id, prompt: prompt, image_url: generatedImageUrl })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save image record:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save image." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Return the generated image URL
    return new Response(JSON.stringify({ imageUrl: imageRecord.image_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
