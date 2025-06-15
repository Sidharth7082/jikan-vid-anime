import React, { useEffect, useState } from 'react';
import { fetchSeasonalAnime } from "@/lib/api";
import SeasonalAnimeCard from "@/components/SeasonalAnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SeasonalAnimeSectionProps {
  onCardClick: (anime: any) => void;
}

const SeasonalAnimeSection = ({ onCardClick }: SeasonalAnimeSectionProps) => {
  const [seasonalAnime, setSeasonalAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSeason, setCurrentSeason] = useState(true);

  useEffect(() => {
    const loadSeasonalAnime = async () => {
      setLoading(true);
      try {
        const result = await fetchSeasonalAnime();
        setSeasonalAnime(result.data);
      } catch (e) {
        toast({
          title: "Failed to fetch seasonal anime.",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    if (currentSeason) {
        loadSeasonalAnime();
    } else {
        setSeasonalAnime([]);
    }
  }, [currentSeason]);

  return (
    <div id="seasonal-anime" className="max-w-7xl mx-auto w-full px-3 sm:px-8">
      <div className="flex items-start md:items-center justify-between mt-12 mb-6 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
                <CalendarDays className="text-purple-600 w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Seasonal Anime</h2>
                <p className="text-zinc-500">Discover anime by season and year</p>
            </div>
        </div>
        <div className="flex items-center space-x-2 self-end md:self-center">
          <Checkbox id="current-season" checked={currentSeason} onCheckedChange={(checked) => setCurrentSeason(!!checked)} />
          <Label htmlFor="current-season" className="font-medium text-zinc-800">
            Current Season
          </Label>
        </div>
      </div>
      {loading ? (
        <section className="mt-4 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="aspect-[2/3] rounded-2xl w-full h-[350px] bg-gradient-to-b from-zinc-100 to-zinc-200 animate-pulse"
            />
          ))}
        </section>
      ) : (
        <>
            <p className="text-zinc-600 mb-4">Currently airing anime this season</p>
            <section className="mt-2 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {seasonalAnime.slice(0, 15).map((anime: any) => (
                <SeasonalAnimeCard
                key={anime.mal_id}
                anime={anime}
                onClick={() => onCardClick(anime)}
                />
            ))}
            </section>
        </>
      )}
    </div>
  );
};

export default SeasonalAnimeSection;
