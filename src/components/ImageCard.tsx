import { Download, Maximize } from "lucide-react";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

interface ImageCardProps {
  image: GeneratedImage;
}

const ImageCard = ({ image }: ImageCardProps) => {
  const handleDownload = () => {
    fetch(image.image_url)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `imageforge-${image.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(() => alert('Could not download image.'));
  };

  return (
    <Dialog>
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface shadow-md transition-all duration-300 hover:shadow-primary/20 hover:!border-primary/50">
        <img
          src={image.image_url}
          alt={image.prompt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <p className="text-sm font-medium text-white/90 line-clamp-2">
              {image.prompt}
            </p>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-black/50 text-white hover:bg-black/70 hover:text-white border-white/30">
                <Maximize className="h-4 w-4" />
                <span className="sr-only">View Full Size</span>
              </Button>
            </DialogTrigger>
            <Button variant="outline" size="icon" onClick={handleDownload} className="h-8 w-8 bg-black/50 text-white hover:bg-black/70 hover:text-white border-white/30">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
      </div>

      <DialogContent className="max-w-4xl p-0 border-border bg-surface">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-text line-clamp-1">{image.prompt}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <img src={image.image_url} alt={image.prompt} className="max-h-[80vh] w-full rounded-lg object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCard;
