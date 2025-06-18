
import React, { useState, useEffect } from "react";
import { fetchSeasonalAnime } from "@/lib/api";
import SeasonalAnimeCard from "@/components/SeasonalAnimeCard";
import { fetchAnimeDetails } from "@/lib/api";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MostPopularPage: React.FC = () => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadPopularAnime = async (page: number) => {
    setLoading(true);
    try {
      const result = await fetchSeasonalAnime(page);
      setAnimeList(result.data);
      setHasNextPage(result.pagination?.has_next_page || false);
    } catch (e) {
      toast({
        title: "Failed to fetch popular anime.",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPopularAnime(currentPage);
  }, [currentPage]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (newPage === 1 || hasNextPage || newPage < currentPage)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && animeList.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b1426] pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Most Popular Anime</h1>
            <p className="text-[#9ca3af]">Explore the most popular anime series and movies</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#1f2937] rounded-lg aspect-[3/4] mb-3"></div>
                <div className="bg-[#1f2937] h-4 rounded mb-2"></div>
                <div className="bg-[#1f2937] h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1426] pt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Most Popular Anime</h1>
          <p className="text-[#9ca3af]">Explore the most popular anime series and movies</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {animeList.map((anime) => (
            <SeasonalAnimeCard
              key={anime.mal_id}
              anime={anime}
              onClick={() => handleCardClick(anime)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, Math.max(1, currentPage + 2)))].map((_, index) => {
              const pageNum = Math.max(1, currentPage - 2) + index;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-[#ffb800] text-black'
                      : 'bg-[#1f2937] text-white hover:bg-[#374151]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimeDetailModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        anime={selectedAnime} 
      />
    </div>
  );
};

export default MostPopularPage;
