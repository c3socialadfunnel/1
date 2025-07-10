import { Link, useNavigate } from "react-router-dom";
import { Bot, Sparkles, LayoutDashboard, ImageIcon, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    if (!email) return "?";
    const parts = email.split("@")[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block">AI ImageForge</span>
        </Link>
        
        {session && user && (
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Button variant="ghost" asChild>
              <Link to="/dashboard" className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/gallery" className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </Link>
            </Button>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : session && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-text">
                      {user.user_metadata?.display_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-textSecondary">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden cursor-pointer">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden cursor-pointer">
                  <Link to="/gallery" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Gallery
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
