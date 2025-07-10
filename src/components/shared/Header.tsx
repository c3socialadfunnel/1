import { Link } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block">AI ImageForge</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {/* Add nav links here if needed */}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Log In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/auth">
              <Sparkles className="h-4 w-4 mr-2" />
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
