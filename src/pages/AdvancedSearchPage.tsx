
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdvancedSearch, SearchFilters } from "@/components/AdvancedSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import AnimeCard from "@/components/AnimeCard";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const params: any = {
        limit: 25,
        page: 1,
      };

      if (filters.query) params.q = filters.query;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.rating) params.rating = filters.rating;
      if (filters.year) params.start_date = filters.year;
      if (filters.genres.length > 0) params.genres = filters.genres.join(',');
      if (filters.sort) {
        const sortMap: { [key: string]: string } = {
          'Score': 'score',
          'Title': 'title',
          'Start Date': 'start_date',
          'End Date': 'end_date',
          'Episodes': 'episodes',
          'Rank': 'rank',
          'Popularity': 'popularity'
        };
        params.order_by = sortMap[filters.sort] || 'score';
        params.sort = filters.order;
      }

      const response = await axios.get("https://api.jikan.moe/v4/anime", { params });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search anime. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = (anime: any) => {
    setSelectedAnime(anime);
  };

  const handleMainSearch = (anime: any) => {
    if (anime) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#181520]">
      <NavBar onSearch={handleMainSearch} />
      <div className="text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
            <p className="text-gray-400">Find anime with detailed filters</p>
          </div>

          <AdvancedSearch onSearch={handleSearch} className="mb-8" />

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          )}

          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">No results found</p>
              <p>Try adjusting your search filters</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {searchResults.map((anime: any) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={anime}
                  onClick={() => handleAnimeClick(anime)}
                  className="bg-[#211F2D] border-gray-700 hover:border-purple-500 transition-all"
                />
              ))}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">Use the search filters above</p>
              <p>Find anime by genre, type, year, and more</p>
            </div>
          )}
        </div>
      </div>

      {selectedAnime && (
        <AnimeDetailModal
          anime={selectedAnime}
          open={!!selectedAnime}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedAnime(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdvancedSearchPage;
