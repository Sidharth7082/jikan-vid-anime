
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
    className="bg-card hover:scale-105 transition-transform rounded-lg shadow-lg overflow-hidden cursor-pointer flex flex-col"
    onClick={onClick}
    tabIndex={0}
    aria-label={anime.title}
  >
    <img
      src={anime.images.webp?.image_url || anime.images.jpg.image_url}
      alt={anime.title}
      className="aspect-[2/3] w-full object-cover"
      loading="lazy"
    />
    <div className="flex-1 flex flex-col px-3 pb-3 pt-2">
      <h3 className="font-semibold text-base mb-0.5 text-ellipsis line-clamp-2" title={anime.title}>
        {anime.title}
      </h3>
      <div className="flex flex-wrap gap-1 text-xs mb-1 text-muted-foreground">
        {anime.genres?.slice(0, 2).map((g) => (
          <span className="bg-secondary rounded px-1.5 py-0.5" key={g.name}>{g.name}</span>
        ))}
      </div>
      <div className="mt-auto text-sm flex items-center gap-2">
        {anime.score && (
          <span className="bg-primary/90 text-primary-foreground rounded px-2 py-0.5 font-semibold animate-fade-in">
            ★ {anime.score}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default AnimeCard;
