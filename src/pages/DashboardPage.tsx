import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Sparkles, Download, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const DashboardPage = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth");
    }
  }, [session, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-image', {
        body: { prompt },
      });

      if (functionError) {
        // Handle specific errors from the function
        if (functionError.message.includes("Insufficient credits")) {
          setError("You've run out of credits! Please upgrade for more.");
        } else {
          throw new Error(functionError.message);
        }
      } else if (data.error) {
        // Handle application-level errors returned in the function's body
        setError(data.error);
      } else {
        setGeneratedImageUrl(data.imageUrl);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error invoking Supabase function:", err);
      setError("Our AI is a bit busy. Please try a different prompt or try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Render nothing while the redirect is in progress
  }

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-textSecondary">
            Welcome back, <span className="font-semibold text-primary">{user.email}</span>
          </p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
          Sign Out
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <Card className="bg-surface/50 border-border shadow-lg h-full sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-text">
                <Sparkles className="w-6 h-6 text-primary" />
                Create Your Vision
              </CardTitle>
              <CardDescription className="text-textSecondary">
                Describe the image you want to create. Be as specific as you want.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-text">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., An astronaut riding a horse on Mars, cinematic lighting"
                    className="min-h-[120px]"
                    disabled={isGenerating}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isGenerating || !prompt}>
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Image Display */}
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] w-full rounded-xl border-2 border-dashed border-border bg-surface/30 flex items-center justify-center overflow-hidden p-4">
            {isGenerating && (
              <div className="flex flex-col items-center gap-4 text-textSecondary animate-pulse">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="font-medium text-lg">Generating your masterpiece...</p>
                <p className="text-sm text-center max-w-xs">This can take up to 30 seconds depending on the complexity of the prompt.</p>
              </div>
            )}
            {error && !isGenerating && (
              <div className="flex flex-col items-center gap-3 text-center text-error">
                <AlertTriangle className="w-12 h-12 text-error/80" />
                <p className="font-bold text-lg">Generation Failed</p>
                <p className="text-sm max-w-sm">{error}</p>
                <Button variant="secondary" onClick={() => { setError(null); setPrompt(''); }}>Try Again</Button>
              </div>
            )}
            {!isGenerating && !error && generatedImageUrl && (
              <div className="relative group w-full h-full rounded-lg overflow-hidden">
                <img src={generatedImageUrl} alt={prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => window.open(generatedImageUrl, '_blank')}>
                    <Download className="w-5 h-5" />
                    <span className="sr-only">Download Image</span>
                  </Button>
                </div>
              </div>
            )}
            {!isGenerating && !error && !generatedImageUrl && (
              <div className="flex flex-col items-center gap-4 text-textSecondary">
                <ImageIcon className="w-16 h-16" />
                <p className="font-medium text-lg">Your generated image will appear here</p>
                <p className="text-sm text-center max-w-xs">Enter a prompt on the left and click "Generate" to see the magic happen.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
