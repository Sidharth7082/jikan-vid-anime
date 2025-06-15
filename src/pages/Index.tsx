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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NekosApiGallery from "@/components/NekosApiGallery";

// Loader overlay for async actions
const LoaderOverlay = ({ show }: { show: boolean }) =>
  show ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none animate-fade-in">
      <Loader2 className="w-16 h-16 text-[#e50914] animate-spin drop-shadow-xl" />
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

  // For tracking tabs: added "nekos" tab
  const [tab, setTab] = useState<"anime" | "gif" | "nekos">("anime");

  const { token, setToken } = useWaifuApiToken();

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
    if (tab === "anime") loadTopAnime();
  }, [tab, loadTopAnime]);

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
      // Always use v4 endpoint (per docs)
      const res = await axios.get("https://waifu.it/api/v4/waifu", {
        headers: { Authorization: usedToken }
      });
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-r from-[#18181e] via-[#16151a] to-[#111016]">
        <AppSidebar />
        <main className="flex-1 flex flex-col px-0 lg:px-0 w-full relative">
          <LoaderOverlay show={loading || waifuLoading} />
          <header
            className={cn(
              "sticky top-0 z-30 w-full bg-black/80 backdrop-blur-xl ring-1 ring-[#262626]/65 shadow-lg",
              "transition-all"
            )}
          >
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-4 px-5 gap-0 sm:gap-2">
              <h1
                className="text-[2.3rem] md:text-4xl tracking-tight font-black font-sans text-center text-white drop-shadow-[0_6px_28px_rgba(229,9,20,0.45)] select-none pointer-events-none"
                style={{ letterSpacing: "-1.5px" }}
              >
                <span className="bg-gradient-to-r from-[#e50914] via-rose-800 to-pink-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(229,9,20,0.3)]">
                  AnimeHub
                </span>
              </h1>
              <Tabs
                defaultValue="anime"
                value={tab}
                onValueChange={value => setTab(value as "anime" | "gif" | "nekos")}
                className="w-full max-w-3xl mt-3 sm:mt-2"
              >
                <TabsList className="flex w-full bg-zinc-900/80 shadow rounded-full p-1">
                  <TabsTrigger
                    value="anime"
                    className={cn(
                      "transition w-1/3 rounded-full px-0 py-2 text-lg font-medium hover:bg-zinc-900/60 hover:text-white",
                      tab === "anime"
                        ? "bg-gradient-to-r from-[#e50914] via-red-700 to-pink-600 text-white shadow"
                        : "text-zinc-300"
                    )}
                  >
                    Anime
                  </TabsTrigger>
                  <TabsTrigger
                    value="gif"
                    className={cn(
                      "transition w-1/3 rounded-full px-0 py-2 text-lg font-medium hover:bg-zinc-900/60 hover:text-white",
                      tab === "gif"
                        ? "bg-gradient-to-r from-pink-600 via-pink-800 to-[#ae1d25] text-white shadow"
                        : "text-zinc-300"
                    )}
                  >
                    Waifu GIF
                  </TabsTrigger>
                  <TabsTrigger
                    value="nekos"
                    className={cn(
                      "transition w-1/3 rounded-full px-0 py-2 text-lg font-medium hover:bg-zinc-900/60 hover:text-white",
                      tab === "nekos"
                        ? "bg-gradient-to-r from-blue-700 via-blue-900 to-violet-700 text-white shadow"
                        : "text-zinc-300"
                    )}
                  >
                    NekosAPI Gallery
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="anime" className="w-full">
                  <div className="w-full mt-5 flex flex-col sm:flex-row justify-center gap-2 items-center">
                    <div className="flex-1 w-full max-w-lg">
                      <AnimeSearchBar onSelect={handleSearchResult} />
                    </div>
                  </div>
                  <main className="max-w-7xl mx-auto w-full pb-20 pt-4 px-2 sm:px-6">
                    {loading ? (
                      <section className="mt-6 grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[...Array(18)].map((_, idx) => (
                          <Skeleton
                            key={idx}
                            className="aspect-[2/3] rounded-2xl w-full h-64 bg-gradient-to-b from-zinc-900/80 to-zinc-800/80 animate-pulse"
                          />
                        ))}
                      </section>
                    ) : (
                      <section
                        className={cn(
                          "mt-2 grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
                          "px-2 relative z-10"
                        )}
                        style={{
                          backdropFilter: "blur(2px)",
                          WebkitBackdropFilter: "blur(2px)",
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
                </TabsContent>
                <TabsContent
                  value="gif"
                  className="w-full flex flex-col items-center py-12 min-h-[60vh]"
                >
                  <Button
                    className="bg-gradient-to-r from-pink-700 to-red-500 text-white shadow-xl hover:scale-105 transition border-none px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2"
                    onClick={handleWaifuGifClick}
                    disabled={waifuLoading}
                    size="lg"
                  >
                    <ImagePlus className="mr-2" />
                    {waifuLoading ? "Loading..." : "Get Random Waifu GIF"}
                  </Button>
                  {waifuImg && (
                    <div className="mt-8 p-4 bg-zinc-900/80 rounded-2xl shadow-2xl flex flex-col items-center border border-zinc-800/70 animate-scale-in">
                      <img
                        src={waifuImg}
                        alt={waifuName || "random waifu"}
                        className="w-80 h-80 object-contain rounded-xl shadow-lg border border-zinc-800 bg-black/80"
                      />
                      {waifuName && (
                        <div className="text-lg text-white font-semibold mt-4">{waifuName}</div>
                      )}
                    </div>
                  )}
                </TabsContent>
                <TabsContent
                  value="nekos"
                  className="w-full flex flex-col items-center py-12 min-h-[60vh]"
                >
                  <NekosApiGallery />
                </TabsContent>
              </Tabs>
            </div>
          </header>
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
          <footer className="w-full py-8 text-center text-neutral-400 text-sm bg-gradient-to-t from-[#000000cc] via-transparent to-transparent z-20 backdrop-blur-lg shadow-inner mt-auto">
            <span className="font-bold tracking-wide text-white/90 drop-shadow mx-1">
              AnimeHub
            </span>
            — Powered by{" "}
            <a
              href="https://jikan.moe/"
              target="_blank"
              rel="noopener noreferrer"
              className="story-link underline font-bold text-[#e50914] hover:text-red-400 transition mx-1"
            >
              Jikan API
            </a>
            {" | Streaming by "}
            <a
              href="https://vidsrc.to/"
              target="_blank"
              rel="noopener noreferrer"
              className="story-link underline font-bold text-[#e50914] hover:text-red-400 transition mx-1"
            >
              Vidsrc
            </a>
          </footer>
        </main>
      </div>
      <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-[#18181e]/90 rounded-full p-2 shadow-lg ring-1 ring-zinc-900 hover:bg-[#e50914]/90 hover:text-white transition" />
    </SidebarProvider>
  );
};

export default Index;
