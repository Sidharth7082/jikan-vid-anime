
import React from "react";
import { Play, Star } from "lucide-react";

interface AnimeCardProps {
  anime: any;
  onClick: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const imageUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;
  const title = anime.title || anime.title_english || "Unknown Title";
  const score = anime.score || 0;
  const year = anime.year || anime.aired?.prop?.from?.year || "N/A";
  const status = anime.status || "Unknown";
  const episodes = anime.episodes || "?";

  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-[#1f2937] shadow-lg">
        {/* Poster Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-[#ffb800] rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-black fill-current" />
            </div>
          </div>

          {/* Episode Count */}
          {episodes !== "?" && (
            <div className="absolute top-2 left-2 bg-[#ffb800] text-black px-2 py-1 rounded text-xs font-semibold">
              {episodes === null ? "Movie" : `${episodes} EP`}
            </div>
          )}

          {/* Score Badge */}
          {score > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 text-[#ffb800] px-2 py-1 rounded flex items-center gap-1 text-xs font-semibold">
              <Star className="w-3 h-3 fill-current" />
              {score.toFixed(1)}
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
            {status}
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[#ffb800] transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>{year}</span>
            <span className="capitalize">
              {anime.type?.toLowerCase() || "TV"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
