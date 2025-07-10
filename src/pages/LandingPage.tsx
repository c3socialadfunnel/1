import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Brush, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute inset-0 animate-aurora opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(at 27% 37%, hsla(262, 84%, 70%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 97% 21%, hsla(204, 96%, 62%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 52% 99%, hsla(336, 80%, 71%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 10% 29%, hsla(262, 84%, 70%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 97% 96%, hsla(204, 96%, 62%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 33% 50%, hsla(336, 80%, 71%, 1) 0px, transparent 50%), " +
                "radial-gradient(at 79% 53%, hsla(262, 84%, 70%, 1) 0px, transparent 50%)",
              filter: "blur(100px) saturate(150%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent md:text-6xl lg:text-7xl bg-clip-text bg-gradient-to-b from-white to-zinc-400">
              Forge Imagination into Reality
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-textSecondary md:text-xl">
              Unleash your creative potential with ImageForge. Our advanced AI turns your text prompts into stunning, high-quality images in seconds.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight">Why ImageForge?</h2>
            <p className="mt-4 text-lg text-muted-foreground">The ultimate toolkit for digital artists and creators.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Bot className="h-8 w-8 text-primary" />}
              title="Advanced AI Engine"
              description="Leverage state-of-the-art diffusion models for unparalleled image quality and prompt adherence."
            />
            <FeatureCard
              icon={<Brush className="h-8 w-8 text-primary" />}
              title="Infinite Creative Styles"
              description="From photorealistic portraits to abstract art, explore a vast range of artistic styles with simple commands."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Lightning-Fast Generation"
              description="Don't wait for inspiration. Generate multiple high-resolution images in seconds and iterate on your ideas instantly."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="rounded-xl border border-border bg-surface/50 p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-surface hover:shadow-2xl hover:shadow-primary/10">
    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default LandingPage;
