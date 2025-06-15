import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import { toast } from "@/hooks/use-toast";
import WaifuGifModal from "@/components/WaifuGifModal";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import HeroBanner from "@/components/HeroBanner";
import TopAnimeSection from "@/components/TopAnimeSection";
import ImageGallerySection from "@/components/ImageGallerySection";

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

  const pickRandomFeaturedAnime = useCallback((list: any[]) => {
    if (list && list.length > 0) {
      const randomIndex = Math.floor(Math.random() * list.length);
      setFeaturedAnime(list[randomIndex]);
    }
  }, []);

  const loadTopAnime = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchTopAnime();
      setAnimeList(result.data);
      pickRandomFeaturedAnime(result.data);
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

        <HeroBanner
          featuredAnime={featuredAnime}
          animeList={animeList}
          onViewDetailsClick={handleCardClick}
          onGetAnotherClick={pickRandomFeaturedAnime}
        />

        {/* Main Content */}
        <main className="flex-1 w-full pb-10">
          <LoaderOverlay show={loading || waifuLoading} />

          <TopAnimeSection
            loading={loading}
            animeList={animeList}
            onCardClick={handleCardClick}
          />

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
        <Footer />
      </div>
      {/* Mobile Sidebar Trigger */}
      <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-white/80 rounded-full p-2 shadow-lg ring-1 ring-zinc-900 hover:bg-purple-200/90 hover:text-purple-800 transition" />
    </SidebarProvider>
  );
};

export default Index;
