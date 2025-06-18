import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import AnimeCard from "@/components/AnimeCard";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopAnimeSectionProps {
  loading: boolean;
  animeList: any[];
  onCardClick: (anime: any) => void;
}

const TopAnimeSection = ({ loading, animeList, onCardClick }: TopAnimeSectionProps) => {
  return (
    <div id="top-anime" className="max-w-7xl mx-auto w-full px-3 sm:px-8 pb-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-12 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Star className="text-purple-600 w-7 h-7" />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight drop-shadow">Top Anime</h2>
            <p className="text-zinc-500">Highest rated on MyAnimeList</p>
          </div>
        </div>
        <Link to="/browse/all" className="text-purple-700 font-medium underline underline-offset-2 transition hover:text-purple-500 self-end md:self-center">View All →</Link>
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
              onClick={() => onCardClick(anime)}
              className="shadow-md rounded-2xl hover:scale-105 transition group bg-white"
              badgeClass="bg-gradient-to-r from-yellow-400 to-orange-400 text-white drop-shadow"
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default TopAnimeSection;
