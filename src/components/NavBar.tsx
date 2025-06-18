import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { Home, User, History, Heart, Bell, FileText, Settings, LogOut, Instagram, Menu } from "lucide-react";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NavBar = ({
  onSearch
}: {
  onSearch: (v: any) => void;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSearchSelect = (v: any) => {
    onSearch(v);
    setIsMobileMenuOpen(false);
  };

  return <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-zinc-200 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 py-2 px-5">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-3xl font-extrabold tracking-tight" style={{
          color: "#7D36FF"
        }}>
            captureordie
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-medium text-zinc-900 rounded-full bg-zinc-100 px-4 py-1.5 shadow transition hover:bg-purple-100 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Home
            </Link>
            <a href="/#top-anime" className="hover:underline text-zinc-700 font-medium transition">Top Anime</a>
            
            <Link to="/gifs" className="hover:underline text-zinc-700 font-medium transition">GIFs</Link>
            <Link to="/danbooru" className="hover:underline text-zinc-700 font-medium transition">Danbooru</Link>
            <a href="/#image" className="hover:underline text-zinc-700 font-medium transition">Image</a>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <AnimeSearchBar onSelect={onSearch} className="max-w-none w-auto mb-0" wrapperClass="!bg-zinc-100 !border-zinc-300 !rounded-full w-60" placeholder="Search anime..." />
          </div>
          {session ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.user_metadata.avatar_url as string || undefined} alt={session.user.email ?? ''} />
                    <AvatarFallback>{session.user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-[#211F2D] text-white border-none rounded-xl p-2 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.user_metadata.full_name as string || session.user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#3A374A]/50" />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem asChild className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <Link to="/profile">
                      <User className="mr-3 h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  
                  
                  
                  <DropdownMenuItem asChild className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <Link to="/settings">
                      <Settings className="mr-3 h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-[#3A374A]/50" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <div className="hidden md:block"><Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/auth">Login</Link>
            </Button></div>}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white/95 backdrop-blur-sm">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-extrabold tracking-tight" style={{ color: "#7D36FF" }}>
                         captureordie
                       </Link>
                    </div>
                    <div className="p-4">
                      <AnimeSearchBar onSelect={handleSearchSelect} placeholder="Search anime..." />
                    </div>
                    <nav className="flex flex-col p-4 space-y-1">
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium p-3 rounded-lg hover:bg-zinc-100 transition-colors">
                        <Home className="w-6 h-6 text-purple-600" />
                        <span>Home</span>
                      </Link>
                      <a href="/#top-anime" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-3 rounded-lg hover:bg-zinc-100 transition-colors">Top Anime</a>
                      <Link to="/gifs" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-3 rounded-lg hover:bg-zinc-100 transition-colors">GIFs</Link>
                      <Link to="/danbooru" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-3 rounded-lg hover:bg-zinc-100 transition-colors">Danbooru</Link>
                      <a href="/#image" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium p-3 rounded-lg hover:bg-zinc-100 transition-colors">Image</a>
                    </nav>
                    <div className="mt-auto p-4 border-t">
                      {!session && (
                        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link to="/auth">Login</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </nav>;
};
export default NavBar;
