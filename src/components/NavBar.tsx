
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { Button } from "@/components/ui/button";

const NavBar = ({ onSearch }: { onSearch: (v: any) => void }) => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-zinc-200 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 py-2 px-5">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-3xl font-extrabold tracking-tight" style={{ color: "#7D36FF" }}>
            captureordie
          </Link>
          <a href="#" className="font-medium text-zinc-900 rounded-full bg-zinc-100 px-4 py-1.5 shadow transition hover:bg-purple-100 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home
          </a>
          <a href="#top-anime" className="hover:underline text-zinc-700 font-medium transition">Top Anime</a>
          <a href="#seasonal" className="hover:underline text-zinc-700 font-medium transition">Seasonal</a>
          <a href="#random" className="hover:underline text-zinc-700 font-medium transition">Random</a>
          <a href="#image" className="hover:underline text-zinc-700 font-medium transition">Image</a>
        </div>
        <div className="flex items-center gap-4">
          <AnimeSearchBar
            onSelect={onSearch}
            className="max-w-none w-auto mb-0"
            wrapperClass="!bg-zinc-100 !border-zinc-300 !rounded-full w-60"
            placeholder="Search anime..."
          />
          {session ? (
            <Button onClick={handleLogout} variant="outline" className="text-purple-700 border-purple-400 hover:bg-purple-50">Logout</Button>
          ) : (
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
