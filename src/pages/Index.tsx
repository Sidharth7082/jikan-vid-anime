
import React, { useEffect, useState, useCallback } from "react";
import { fetchTopAnime, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import AnimeSearchBar from "@/components/AnimeSearchBar";
import { toast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 px-0 py-0">
      <header className="sticky top-0 z-10 px-0 py-8 bg-bg/80 backdrop-blur">
        <h1 className="text-4xl tracking-tight font-extrabold text-center mb-2 text-primary-foreground drop-shadow-md">
          Anime Vault
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-center mb-4 text-muted-foreground">
          Discover, search, and watch trending anime. Data by Jikan/MAL, streams via Vidsrc demo links.
        </p>
        <AnimeSearchBar
          onSelect={async (anime) => {
            await handleCardClick(anime);
          }}
        />
      </header>
      <main className="max-w-7xl mx-auto w-full px-4 pb-16">
        {loading ? (
          <div className="w-full flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <section
            className="
              mt-8 grid gap-7
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              2xl:grid-cols-6
            "
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
      <footer className="w-full py-6 text-center text-muted-foreground text-xs mt-8">
        Built with <span className="font-medium">Lovable</span> · Data by <a href="https://jikan.moe/" target="_blank" className="underline">Jikan API</a>
      </footer>
    </div>
  );
};

export default Index;
