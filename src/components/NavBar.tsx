
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NavBar = ({
  onSearch
}: {
  onSearch: (v: any) => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};
export default NavBar;
