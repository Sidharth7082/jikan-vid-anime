
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  featuredAnime: any;
  animeList: any[];
  onViewDetailsClick: (anime: any) => void;
  onGetAnotherClick: (list: any[]) => void;
}

const HeroBanner = ({ featuredAnime, animeList, onViewDetailsClick, onGetAnotherClick }: HeroBannerProps) => {
  return (
    <section
      className="relative flex flex-col justify-center min-h-[340px] md:min-h-[380px] w-full overflow-hidden"
      style={{
        background: featuredAnime?.images?.jpg?.large_image_url
          ? `url(${featuredAnime.images.jpg.large_image_url}) center/cover no-repeat`
          : "#f8eaff",
      }}
    >
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" />
      <div className="relative z-10 px-4 py-12 sm:py-20 max-w-5xl mx-auto flex flex-col gap-4">
        <div className="text-[#87f] font-semibold text-base flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-[#87f]" />
          Featured Random Pick
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{featuredAnime?.title || "Tish Tash"}</div>
        <div className="text-lg md:text-xl text-white/90 font-medium drop-shadow-sm max-w-2xl">
          {featuredAnime?.synopsis
            ? featuredAnime.synopsis.length > 220
              ? featuredAnime.synopsis.substring(0, 220) + "..."
              : featuredAnime.synopsis
            : "Growing up can be tough, especially when you're a family of bears and your younger brother is a bit of a wild animal. Luckily Tish has a ridiculously huge imagination and a larger than life, imaginary friend Tash. No matter what trouble..."}
        </div>
        <div className="flex items-center gap-4 text-white/80 font-medium mt-1">
          <span>{featuredAnime?.year || 2020}</span>
          <span>·</span>
          <span>{featuredAnime?.episodes ? `${featuredAnime.episodes} episodes` : "26 episodes"}</span>
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow-md"
            onClick={() => featuredAnime && onViewDetailsClick(featuredAnime)}
            disabled={!featuredAnime}
          >
            View Details
          </Button>
          <Button
            className="bg-white/90 text-purple-700 border border-purple-400 hover:bg-purple-50 hover:scale-105 px-7 py-2.5 text-lg rounded-xl font-bold shadow"
            onClick={() => onGetAnotherClick(animeList)}
            variant="outline"
          >
            Get Another
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
