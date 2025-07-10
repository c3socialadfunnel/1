import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Loader2, ServerCrash, Sparkles } from "lucide-react";
import ImageCard from "@/components/ImageCard";
import { Button } from "@/components/ui/Button";

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

const GalleryPage = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchImages();
    }
  }, [session]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("images")
        .select("id, prompt, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      console.error("Error fetching images:", err);
      setError("Could not load your gallery. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-textSecondary py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading Your Gallery...</p>
          <p>Fetching your masterpieces from the digital ether.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-error bg-surface/50 rounded-lg p-10">
          <ServerCrash className="w-12 h-12 mb-4" />
          <p className="text-lg font-bold">Oops! Something went wrong.</p>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchImages}>Try Again</Button>
        </div>
      );
    }

    if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-textSecondary border-2 border-dashed border-border rounded-lg py-20 px-4">
          <ImageIcon className="w-16 h-16 mb-4" />
          <h3 className="text-2xl font-bold text-text mb-2">Your Gallery is Empty</h3>
          <p className="mb-6 max-w-md">It looks like you haven't generated any images yet. Let's change that!</p>
          <Button asChild>
            <Link to="/dashboard">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Image
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Your Gallery
        </h1>
        <p className="mt-3 text-xl text-textSecondary">
          A collection of your AI-generated visions.
        </p>
      </div>
      {renderContent()}
    </div>
  );
};

export default GalleryPage;
