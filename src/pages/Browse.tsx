import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAnimeByLetter, fetchAnimeDetails } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { useInView } from "react-intersection-observer";

const Browse = () => {
  const { letter } = useParams<{ letter: string }>();
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { ref, inView } = useInView({ threshold: 0 });

  const loadAnime = useCallback(async (page = 1, fresh = false) => {
    if (!letter) return;
    setLoading(true);
    try {
      const result = await fetchAnimeByLetter(letter, page);
      setAnimeList(prev => fresh ? result.data : [...prev, ...result.data]);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Error fetching anime",
        description: `Could not fetch anime for letter "${letter}".`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [letter]);

  useEffect(() => {
    setAnimeList([]);
    loadAnime(1, true);
  }, [letter, loadAnime]);

  useEffect(() => {
    if (inView && !loading && pagination?.has_next_page) {
      loadAnime(currentPage + 1);
    }
  }, [inView, loading, pagination, currentPage, loadAnime]);

  const handleCardClick = async (anime: any) => {
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
  
  const handleSearch = async (): Promise<void> => {};

  const pageTitle = letter === 'all' ? 'Top Anime Series' : `Anime starting with "${letter?.toUpperCase()}"`;

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90">
      <NavBar onSearch={handleSearch} />
      <div className="flex-1">
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-8 pb-10">
          <div className="flex items-center justify-between mt-12 mb-6">
              <div className="flex items-center gap-4">
                  <Link to="/" className="p-2 rounded-full hover:bg-zinc-200 transition-colors">
                      <ArrowLeft className="w-6 h-6 text-zinc-700" />
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight drop-shadow">
                      {pageTitle}
                  </h1>
              </div>
          </div>

          {loading && animeList.length === 0 ? (
            <section className="grid gap-7 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {[...Array(18)].map((_, idx) => (
                <Skeleton key={idx} className="aspect-[2/3] rounded-2xl w-full h-64 bg-gradient-to-b from-zinc-100 to-zinc-200" />
              ))}
            </section>
          ) : animeList.length > 0 ? (
            <section className="grid gap-7 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {animeList.map((anime: any, index) => (
                <AnimeCard
                  key={`${anime.mal_id}-${index}`}
                  anime={anime}
                  onClick={() => handleCardClick(anime)}
                  className="shadow-md rounded-2xl hover:scale-105 transition group bg-white"
                />
              ))}
            </section>
          ) : !loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-zinc-600">No anime found for letter "{letter?.toUpperCase()}".</p>
            </div>
          ) : null}

          {pagination?.has_next_page && (
              <div ref={ref} className="mt-10 text-center">
                  <Button onClick={() => loadAnime(currentPage + 1)} disabled={loading}>
                      {loading ? 'Loading...' : 'Load More'}
                  </Button>
              </div>
          )}
        </main>
      </div>
      <Footer />
      <AnimeDetailModal open={modalOpen} onOpenChange={setModalOpen} anime={selectedAnime} />
    </div>
  );
};

export default Browse;
