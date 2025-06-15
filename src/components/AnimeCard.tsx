import React from "react";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface Props {
  anime: {
    mal_id: number;
    title: string;
    images: { jpg: { image_url: string }; webp?: { image_url: string } };
    score?: number;
    genres?: { name: string }[];
  };
  onClick: () => void;
}

const AnimeCard: React.FC<Props> = ({ anime, onClick }) => (
  <Card
    className="relative group p-0 cursor-pointer transition-transform duration-200 hover:scale-[1.06] hover:z-20 focus:z-20 focus:ring-2 ring-[#e50914] bg-gradient-to-b from-[#232526dd] to-[#19191ea8] shadow-xl overflow-hidden flex flex-col"
    tabIndex={0}
    aria-label={anime.title}
    onClick={onClick}
    onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    style={{
      minHeight: 0,
      boxShadow: "0 8px 32px 0 rgba(10,10,13,0.60)",
    }}
  >
    <div className="overflow-hidden rounded-b-xl flex-shrink-0">
      {anime.images?.webp?.image_url || anime.images?.jpg?.image_url ? (
        <img
          src={anime.images.webp?.image_url || anime.images.jpg.image_url}
          alt={anime.title}
          className="aspect-[2/3] w-full object-cover group-hover:scale-105 transition-transform duration-200 group-hover:brightness-90"
          loading="lazy"
          draggable={false}
          aria-hidden
        />
      ) : (
        <div className="aspect-[2/3] w-full flex items-center justify-center bg-zinc-900 text-zinc-700">
          <ImageIcon className="w-12 h-12" />
        </div>
      )}
      {/* Glass gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-200 pointer-events-none" />
    </div>
    <div className="flex-1 flex flex-col px-3 pb-3 pt-2 z-10 min-h-0 justify-between">
      <h3
        className="font-extrabold text-base mb-1 text-white truncate"
        title={anime.title}
        style={{
          textShadow: "0 2px 10px rgba(0,0,0,0.4)",
        }}
      >
        {anime.title}
      </h3>
      <div className="flex flex-wrap gap-1 text-xs mb-1 text-neutral-300">
        {anime.genres?.slice(0, 2).map((g) => (
          <span
            className="bg-[#232323bb] rounded px-2 py-0.5"
            key={g.name}
          >
            {g.name}
          </span>
        ))}
      </div>
      <div className="mt-auto text-sm flex items-center gap-2">
        {!!anime.score && (
          <span className="bg-[#e50914] text-white rounded px-2 py-0.5 font-bold animate-fade-in shadow shadow-[#e50914]/40 tracking-wide drop-shadow">
            ★ {anime.score}
          </span>
        )}
      </div>
    </div>
  </Card>
);

export default AnimeCard;
