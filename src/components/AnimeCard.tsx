
import React from "react";

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
  <div
    className="relative bg-gradient-to-b from-[#232526] to-[#18181e] rounded-xl shadow-2xl overflow-hidden cursor-pointer flex flex-col group transition-transform duration-200 hover:scale-[1.08] hover:z-20 focus:z-20 focus:ring-2 ring-[#e50914]"
    onClick={onClick}
    tabIndex={0}
    aria-label={anime.title}
    style={{
      boxShadow: "0 8px 32px 0 rgba(10,10,13,0.60)", minHeight: 0
    }}
  >
    <div className="overflow-hidden rounded-b-xl">
      <img
        src={anime.images.webp?.image_url || anime.images.jpg.image_url}
        alt={anime.title}
        className="aspect-[2/3] w-full object-cover group-hover:scale-105 transition-transform duration-200 group-hover:brightness-90"
        loading="lazy"
        draggable={false}
        aria-hidden
      />
      {/* Fade overlay on hover, Netflix card effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
    <div className="flex-1 flex flex-col px-3 pb-3 pt-2 z-10 min-h-0 justify-between">
      <h3 className="font-extrabold text-base mb-1 text-white truncate" title={anime.title}
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
        {anime.title}
      </h3>
      <div className="flex flex-wrap gap-1 text-xs mb-1 text-neutral-300">
        {anime.genres?.slice(0, 2).map((g) => (
          <span className="bg-[#232323] bg-opacity-80 rounded px-2 py-0.5" key={g.name}>{g.name}</span>
        ))}
      </div>
      <div className="mt-auto text-sm flex items-center gap-2">
        {!!anime.score && (
          <span className="bg-[#e50914] text-white rounded px-2 py-0.5 font-bold animate-fade-in shadow shadow-[#e50914]/30 tracking-wide drop-shadow">
            ★ {anime.score}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default AnimeCard;
