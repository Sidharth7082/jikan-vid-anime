
import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { toast } from "@/hooks/use-toast";

// To mimic Netflix's immersive UX with a black-to-gray gradient and overlays
const Index = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      const fullAnime = await fetchAnimeDetails(anime.mal_id);
      setSelectedAnime(fullAnime);
      setModalOpen(true);
    } catch {
      setSelectedAnime(anime);
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181e] via-[#14171e] to-[#141414] relative">
      {/* Netflix-like translucent black overlay at top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#2d2e36cc] via-transparent to-transparent opacity-85 pointer-events-none z-0" />
      <header className="sticky top-0 z-10 px-0 py-10 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur shadow-xl">
        <h1 className="text-[2.7rem] md:text-5xl tracking-tight font-black font-sans text-left px-8 mb-1 text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.66)] select-none" style={{
          letterSpacing: "-1.5px"
        }}>
          <span className="bg-gradient-to-r from-red-600 to-[#e50914] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(229,9,20,0.58)]">
            Anime<span className="font-black">flix</span>
          </span>
        </h1>
        <p className="max-w-2xl ml-8 text-xl text-left mb-5 text-neutral-300 font-medium drop-shadow select-none">
          Watch top trending anime — crisp UI, immersive like Netflix. Search or select a title to learn more!
        </p>
        <div className="max-w-md mx-8">
          <AnimeSearchBar
            onSelect={async (anime) => {
              await handleCardClick(anime);
            }}
          />
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full pb-16 pt-6">
        {loading ? (
          <div className="w-full flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e50914]"></div>
          </div>
        ) : (
          <section
            className="
              mt-3 grid gap-7
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
              2xl:grid-cols-7
              px-4
              relative
              z-10
            "
          >
            {animeList.map((anime: any) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                onClick={() => handleCardClick(anime)}
                // Add a prop if you make theme/dark variants
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
      <footer className="w-full py-7 text-center text-neutral-400 text-sm mt-16 bg-gradient-to-t from-[#000b] via-transparent to-transparent z-20">
        <span className="font-semibold tracking-wide text-white/90">Animeflix</span>{" "}
        — Powered by <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[#e50914] hover:text-red-400 transition">Jikan API</a>
      </footer>
    </div>
  );
};

export default Index;
