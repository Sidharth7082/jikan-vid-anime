import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import WaifuGifModal from "@/components/WaifuGifModal";
import { useWaifuApiToken } from "@/hooks/useWaifuApiToken";
import axios from "axios";
import { Button } from "@/components/ui/button";

// Loader overlay for async actions
const LoaderOverlay = ({ show }: { show: boolean }) =>
  show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none animate-fade-in">
      <Loader2 className="w-16 h-16 text-[#e50914] animate-spin" />
    </div>
  ) : null;

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

  const { token, setToken, clearToken } = useWaifuApiToken();

  const loadTopAnime = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTopAnime();
      setAnimeList(data.slice(0, 28));
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

  // Waifu GIF logic
  const handleWaifuGifClick = async () => {
    let usedToken = token;
    if (!usedToken) {
      const input = window.prompt("Enter your Waifu.it API token:");
      if (!input) {
        toast({
          title: "No token provided.",
          description: "Waifu GIF service needs your API token.",
          variant: "destructive",
        });
        return;
      }
      setToken(input);
      usedToken = input;
    }
    setWaifuLoading(true);
    setWaifuImg(undefined);
    setWaifuName(undefined);
    try {
      const res = await axios.get("https://waifu.it/api/v4/waifu", {
        headers: { Authorization: usedToken }
      });
      // Response shape is assumed to have status/message as per docs.
      // Let's display the waifu image if present, else error.
      let imgUrl, name;
      if (res.data?.message) {
        imgUrl = res.data.message.url || res.data.message.link || res.data.message.image;
        name = res.data.message.name;
      }
      if (!imgUrl) {
        throw new Error("No valid image found in the API response.");
      }
      setWaifuImg(imgUrl);
      setWaifuName(name);
      setWaifuOpen(true);
    } catch (err: any) {
      toast({
        title: "Failed to fetch waifu GIF.",
        description: err?.message || "Could not get GIF/image.",
        variant: "destructive",
      });
    }
    setWaifuLoading(false);
  };

  return (
    <div className={cn(
      "min-h-screen w-full bg-gradient-to-br from-[#18181e] via-[#111215] to-[#141414] font-sans",
      "relative overflow-x-hidden"
    )}>
      <LoaderOverlay show={loading || waifuLoading} />
      <header className={cn(
        "sticky top-0 z-20 w-full bg-black/55 backdrop-blur-xl",
        "shadow-xl ring-1 ring-[#262626]/55 transition"
      )}>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-0 sm:gap-4 py-6 px-4">
          <h1 className="text-[2.5rem] md:text-5xl tracking-tight font-black font-sans text-center mb-1 text-white drop-shadow-[0_6px_42px_rgba(0,0,0,0.68)] select-none pointer-events-none" style={{
            letterSpacing: "-1.5px"
          }}>
            <span className="bg-gradient-to-r from-red-700 to-[#e50914] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(229,9,20,0.7)]">
              AnimeHub
            </span>
          </h1>
          <div className="w-full flex flex-col sm:flex-row justify-center gap-2 items-center">
            <div className="flex-1 w-full max-w-lg">
              <AnimeSearchBar onSelect={handleSearchResult} />
            </div>
            <Button
              className="ml-0 sm:ml-3 mt-1 sm:mt-0 bg-gradient-to-r from-pink-700 to-red-500 text-white shadow-lg hover:scale-105 transition border-none"
              onClick={handleWaifuGifClick}
              disabled={waifuLoading}
              size="lg"
            >
              <ImagePlus className="mr-1.5" />
              Random Waifu GIF
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full pb-20 pt-1 px-2 sm:px-6">
        {loading ? (
          <section
            className="mt-8 grid gap-7 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
          >
            {[...Array(18)].map((_, idx) => (
              <Skeleton key={idx} className="aspect-[2/3] rounded-2xl w-full h-64 bg-gradient-to-b from-zinc-900/80 to-zinc-800/70" />
            ))}
          </section>
        ) : (
          <section
            className={cn(
              "mt-3 grid gap-7 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7",
              "px-2 relative z-10"
            )}
            style={{
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)"
            }}
          >
            {animeList.map((anime: any) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                onClick={() => handleCardClick(anime)}
              />
            ))}
          </section>
        )}
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
      <footer className="w-full py-7 text-center text-neutral-400 text-sm mt-16 bg-gradient-to-t from-[#000c] via-transparent to-transparent z-20 backdrop-blur-lg">
        <span className="font-semibold tracking-wide text-white/90">AnimeHub</span>{" "}
        — Powered by{" "}
        <a href="https://jikan.moe/"
           target="_blank"
           rel="noopener noreferrer"
           className="underline font-semibold text-[#e50914] hover:text-red-400 transition">{'Jikan API'}</a>
        {" | Streaming by "}
        <a href="https://vidsrc.to/" target="_blank" rel="noopener noreferrer"
           className="underline font-semibold text-[#e50914] hover:text-red-400 transition">{"Vidsrc"}</a>
      </footer>
    </div>
  );
};

export default Index;
