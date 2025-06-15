import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { Home, User, History, Heart, Bell, FileText, Settings, LogOut, Instagram } from "lucide-react";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const NavBar = ({
  onSearch
}: {
  onSearch: (v: any) => void;
}) => {
  const [session, setSession] = useState<Session | null>(null);
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
  return <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-zinc-200 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 py-2 px-5">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-3xl font-extrabold tracking-tight" style={{
          color: "#7D36FF"
        }}>
            captureordie
          </Link>
          <Link to="/" className="font-medium text-zinc-900 rounded-full bg-zinc-100 px-4 py-1.5 shadow transition hover:bg-purple-100 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home
          </Link>
          <a href="/#top-anime" className="hover:underline text-zinc-700 font-medium transition">Top Anime</a>
          
          <Link to="/gifs" className="hover:underline text-zinc-700 font-medium transition">GIFs</Link>
          <Link to="/danbooru" className="hover:underline text-zinc-700 font-medium transition">Danbooru</Link>
          <a href="/#image" className="hover:underline text-zinc-700 font-medium transition">Image</a>
        </div>
        <div className="flex items-center gap-4">
          <AnimeSearchBar onSelect={onSearch} className="max-w-none w-auto mb-0" wrapperClass="!bg-zinc-100 !border-zinc-300 !rounded-full w-60" placeholder="Search anime..." />
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
                  <DropdownMenuItem className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <History className="mr-3 h-5 w-5" />
                    <span>Continue Watching</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <Heart className="mr-3 h-5 w-5 text-pink-400" />
                    <span>Watch List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <Bell className="mr-3 h-5 w-5" />
                    <span>Notification</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:!bg-[#3A374A] focus:!bg-[#3A374A] cursor-pointer p-2 text-sm">
                    <FileText className="mr-3 h-5 w-5" />
                    <span>MAL Import / Export</span>
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
            </DropdownMenu> : <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/auth">Login</Link>
            </Button>}
        </div>
      </div>
    </nav>;
};
export default NavBar;