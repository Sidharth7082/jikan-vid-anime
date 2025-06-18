
import React from "react";
import AnimeCard from "./AnimeCard";

interface TopAnimeSectionProps {
  loading: boolean;
  animeList: any[];
  onCardClick: (anime: any) => void;
}

const TopAnimeSection: React.FC<TopAnimeSectionProps> = ({
  loading,
  animeList,
  onCardClick,
}) => {
  if (loading) {
    return (
      <section className="py-8 px-3 sm:px-8 bg-[#0b1426]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#1f2937] rounded-lg aspect-[3/4] mb-3"></div>
                <div className="bg-[#1f2937] h-4 rounded mb-2"></div>
                <div className="bg-[#1f2937] h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-3 sm:px-8 bg-[#0b1426]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Top Airing Anime</h2>
          <button className="text-[#ffb800] hover:text-[#ff9500] font-medium text-sm transition-colors">
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onClick={() => onCardClick(anime)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopAnimeSection;
