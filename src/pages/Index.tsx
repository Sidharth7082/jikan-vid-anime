
import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import WaifuGifModal from "@/components/WaifuGifModal";
import { useWaifuApiToken } from "@/hooks/useWaifuApiToken";
import axios from "axios";
import { Button } from "@/components/ui/button";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import WaifuPicsGallery from "@/components/WaifuPicsGallery";
import NavBar from "@/components/NavBar";

// Loader overlay for async actions
const LoaderOverlay = ({ show }: { show: boolean }) =>
  show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none animate-fade-in">
      <span className="w-16 h-16 rounded-full border-4 border-[#e50914] border-t-white animate-spin block" />
    </div>
  ) : null;

const Index = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [featuredAnime, setFeaturedAnime] = useState<any | null>(null);

  // Waifu GIF modal state
  const [waifuOpen, setWaifuOpen] = useState(false);
  const [waifuImg, setWaifuImg] = useState<string | undefined>();
  const [waifuName, setWaifuName] = useState<string | undefined>();
  const [waifuLoading, setWaifuLoading] = useState(false);

  // For future: you may introduce tabs for 'seasonal', 'random', etc.

  const { token, setToken } = useWaifuApiToken();

  const pickRandomFeaturedAnime = useCallback((list: any[]) => {
    if (list && list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      setFeaturedAnime(list[randomIndex]);
    }
  }, []);

  const loadTopAnime = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTopAnime();
      setAnimeList(data);
      pickRandomFeaturedAnime(data);
    } catch (e) {
      toast({
        title: "Failed to fetch anime.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [pickRandomFeaturedAnime]);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90">
        <NavBar onSearch={handleSearchResult} />

        {/* Hero Banner */}
        <section
          className="relative flex flex-col justify-center min-h-[340px] md:min-h-[380px] w-full overflow-hidden"
          style={{
            background: featuredAnime?.images?.jpg?.large_image_url
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
            <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{featuredAnime?.title || "Tish Tash"}</div>
            <div className="text-lg md:text-xl text-white/90 font-medium drop-shadow-sm max-w-2xl">
              {featuredAnime?.synopsis
                ? featuredAnime.synopsis.length > 220
                  ? featuredAnime.synopsis.substring(0, 220) + "..."
                  : featuredAnime.synopsis
                : "Growing up can be tough, especially when you're a family of bears and your younger brother is a bit of a wild animal. Luckily Tish has a ridiculously huge imagination and a larger than life, imaginary friend Tash. No matter what trouble..."}
            </div>
            <div className="flex items-center gap-4 text-white/80 font-medium mt-1">
              <span>{featuredAnime?.year || 2020}</span>
              <span>·</span>
              <span>{featuredAnime?.episodes ? `${featuredAnime.episodes} episodes` : "26 episodes"}</span>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow-md"
                onClick={() => featuredAnime && handleCardClick(featuredAnime)}
                disabled={!featuredAnime}
              >
                View Details
              </Button>
              <Button
                className="bg-white/90 text-purple-700 border border-purple-400 hover:bg-purple-50 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow"
                onClick={() => pickRandomFeaturedAnime(animeList)}
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

          {/* Image Gallery Section */}
          <div id="image" className="max-w-7xl mx-auto w-full px-3 sm:px-8 pb-10 pt-8">
            <div className="flex items-center justify-between mt-12 mb-6">
              <div className="flex items-center gap-3">
                <Smile className="text-purple-600 w-7 h-7" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight drop-shadow">Image Gallery</h2>
              </div>
              <a href="https://waifu.pics/docs" target="_blank" rel="noopener noreferrer" className="text-purple-700 font-medium underline underline-offset-2 transition hover:text-purple-500">
                Powered by waifu.pics →
              </a>
            </div>
            <WaifuPicsGallery />
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
