import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Star, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import WaifuGifModal from "@/components/WaifuGifModal";
import { useWaifuApiToken } from "@/hooks/useWaifuApiToken";
import axios from "axios";
import { Button } from "@/components/ui/button";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NekosApiGallery from "@/components/NekosApiGallery";

// Loader overlay for async actions
const LoaderOverlay = ({ show }: { show: boolean }) =>
  show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none animate-fade-in">
      <span className="w-16 h-16 rounded-full border-4 border-[#e50914] border-t-white animate-spin block" />
    </div>
  ) : null;

// Navbar Component (inline - could move to its own file for clarity)
const NavBar = ({ onSearch }: { onSearch: (v: any) => void }) => (
  <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-zinc-200 shadow-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 py-2 px-5">
      <div className="flex items-center gap-6">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: "#7D36FF" }}>
          captureordie
        </span>
        <a href="#" className="font-medium text-zinc-900 rounded-full bg-zinc-100 px-4 py-1.5 shadow transition hover:bg-purple-100 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Home
        </a>
        <a href="#top-anime" className="hover:underline text-zinc-700 font-medium transition">Top Anime</a>
        <a href="#seasonal" className="hover:underline text-zinc-700 font-medium transition">Seasonal</a>
        <a href="#random" className="hover:underline text-zinc-700 font-medium transition">Random</a>
        <a href="#characters" className="hover:underline text-zinc-700 font-medium transition">Characters</a>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <AnimeSearchBar onSelect={onSearch} inputClass="!bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-full !pl-10 w-60 text-sm focus:border-purple-400" placeholder="Search anime..." />
          <Search className="absolute left-2 top-3 text-zinc-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>
    </div>
  </nav>
);

const Index = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Waifu GIF modal state
  const [waifuOpen, setWaifuOpen] = useState(false);
  const [waifuImg, setWaifuImg] = useState<string | undefined>();
  const [waifuName, setWaifuName] = useState<string | undefined>();
  const [waifuLoading, setWaifuLoading] = useState(false);

  // For future: you may introduce tabs for 'seasonal', 'random', etc.

  const { token, setToken } = useWaifuApiToken();

  const loadTopAnime = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTopAnime();
      setAnimeList(data.slice(0, 16));
    } catch (e) {
      toast({
        title: "Failed to fetch anime.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTopAnime();
  }, [loadTopAnime]);

  const handleCardClick = async (anime: any) => {
    setSearching(false);
    setLoading(true);
    try {
      const fullAnime = await fetchAnimeDetails(anime.mal_id);
      setSelectedAnime(fullAnime);
      setModalOpen(true);
    } catch {
      setSelectedAnime(anime);
      setModalOpen(true);
    }
    setLoading(false);
  };

  const handleSearchResult = async (res: any | null) => {
    setSearching(true);
    if (!res) {
      // Reset to top anime when clearing search
      await loadTopAnime();
      setSearching(false);
      return;
    }
    await handleCardClick(res);
    setSearching(false);
  };

  // Featured random anime (just use first anime for demo)
  const featuredAnime = animeList[0] || {};

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90">
        <NavBar onSearch={handleSearchResult} />

        {/* Hero Banner */}
        <section
          className="relative flex flex-col justify-center min-h-[340px] md:min-h-[380px] w-full overflow-hidden"
          style={{
            background: featuredAnime.images?.jpg?.large_image_url
              ? `url(${featuredAnime.images.jpg.large_image_url}) center/cover no-repeat`
              : "#f8eaff",
          }}
        >
          {/* Overlay blur */}
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" />
          {/* Hero Content */}
          <div className="relative z-10 px-4 py-12 sm:py-20 max-w-5xl mx-auto flex flex-col gap-4">
            <div className="text-[#87f] font-semibold text-base flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-[#87f]" />
              Featured Random Pick
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{featuredAnime.title || "Tish Tash"}</div>
            <div className="text-lg md:text-xl text-white/90 font-medium drop-shadow-sm max-w-2xl">
              {featuredAnime.synopsis
                ? featuredAnime.synopsis.length > 220
                  ? featuredAnime.synopsis.substring(0, 220) + "..."
                  : featuredAnime.synopsis
                : "Growing up can be tough, especially when you're a family of bears and your younger brother is a bit of a wild animal. Luckily Tish has a ridiculously huge imagination and a larger than life, imaginary friend Tash. No matter what trouble..."}
            </div>
            <div className="flex items-center gap-4 text-white/80 font-medium mt-1">
              <span>{featuredAnime.year || 2020}</span>
              <span>·</span>
              <span>{featuredAnime.episodes ? `${featuredAnime.episodes} episodes` : "26 episodes"}</span>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow-md"
                onClick={() => handleCardClick(featuredAnime)}
              >
                View Details
              </Button>
              <Button
                className="bg-white/90 text-purple-700 border border-purple-400 hover:bg-purple-50 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow"
                onClick={loadTopAnime}
                variant="outline"
              >
                Get Another
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 w-full pb-10">
          <LoaderOverlay show={loading || waifuLoading} />

          {/* Top Anime Section */}
          <div id="top-anime" className="max-w-7xl mx-auto w-full px-3 sm:px-8 pb-2">
            <div className="flex items-center justify-between mt-12 mb-6">
              <div className="flex items-center gap-3">
                <Star className="text-purple-600" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight drop-shadow">Top Anime</h2>
              </div>
              <a href="#all" className="text-purple-700 font-medium underline underline-offset-2 transition hover:text-purple-500">View All →</a>
            </div>
            {loading ? (
              <section className="mt-4 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {[...Array(12)].map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="aspect-[2/3] rounded-2xl w-full h-64 bg-gradient-to-b from-zinc-100 to-zinc-200 animate-pulse"
                  />
                ))}
              </section>
            ) : (
              <section className={cn(
                "mt-2 grid gap-7 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              )}>
                {animeList.slice(1, 13).map((anime: any) => (
                  <AnimeCard
                    key={anime.mal_id}
                    anime={anime}
                    onClick={() => handleCardClick(anime)}
                    className="shadow-md rounded-2xl hover:scale-105 transition group bg-white"
                    badgeClass="bg-gradient-to-r from-yellow-400 to-orange-400 text-white drop-shadow"
                  />
                ))}
              </section>
            )}
          </div>
        </main>

        <AnimeDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          anime={selectedAnime}
        />
        <WaifuGifModal
          open={waifuOpen}
          onOpenChange={setWaifuOpen}
          gifUrl={waifuImg}
          name={waifuName}
        />
        {/* You can add other sections like Seasonal/Random here */}
        {/* Footer */}
        <footer className="w-full py-8 text-center text-neutral-500 text-sm bg-gradient-to-t from-[#e5e0ff99] via-transparent to-transparent backdrop-blur-lg shadow-inner mt-auto">
          <span className="font-bold tracking-wide text-[#7D36FF] drop-shadow mx-1">
            captureordie
          </span>
          — Powered by{" "}
          <a
            href="https://jikan.moe/"
            target="_blank"
            rel="noopener noreferrer"
            className="story-link underline font-bold text-purple-700 hover:text-purple-500 transition mx-1"
          >
            Jikan API
          </a>
          {" | Streaming by "}
          <a
            href="https://vidsrc.to/"
            target="_blank"
            rel="noopener noreferrer"
            className="story-link underline font-bold text-purple-700 hover:text-purple-500 transition mx-1"
          >
            Vidsrc
          </a>
        </footer>
      </div>
      {/* Mobile Sidebar Trigger */}
      <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-white/80 rounded-full p-2 shadow-lg ring-1 ring-zinc-900 hover:bg-purple-200/90 hover:text-purple-800 transition" />
    </SidebarProvider>
  );
};

export default Index;
