
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  anime: any | null;
}
const getAnimeStreamingId = (anime: any) => {
  // Try to find id from external links for Anilist, TMDB, IMDB
  const anilist = anime?.external?.find((x: any) => /anilist/i.test(x.name));
  if (anilist?.url && anilist.url.match(/anilist\.co\/anime\/(\d+)/i)) {
    return { type: "ani", id: RegExp.$1 };
  }
  // MyAnimeList id fallback
  if (anime?.mal_id) return { type: "mal", id: anime.mal_id };
  return null;
};

const AnimeDetailModal: React.FC<Props> = ({ open, onOpenChange, anime }) => {
  if (!anime) return null;
  // try to get a streaming id for vidsrc
  const mainId = anime.mal_id;
  // Unfortunately, for real embed on Vidsrc, need TMDB, IMDb or Anilist id - for now using MAL id for demo
  // To get TMDB/IMDB id, more API work needed (future improvement).
  const episodeExample = 1;
  const embedUrl = `https://vidsrc.cc/v2/embed/anime/${mainId}/${episodeExample}/sub`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-2xl w-full overflow-y-auto animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-1">{anime.title ?? "Anime"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="rounded-xl object-cover shadow-lg w-40 h-56 mx-auto sm:mx-0"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <p className="line-clamp-6 mb-2 text-muted-foreground">{anime.synopsis}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {anime.genres?.map((g: any) => (
                <span className="bg-accent px-2 py-0.5 text-xs rounded text-accent-foreground" key={g.name}>
                  {g.name}
                </span>
              ))}
              {anime.rating && (
                <span className="bg-muted px-2 py-0.5 rounded text-xs">{anime.rating}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <a
                href={anime.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex justify-center items-center bg-primary text-primary-foreground rounded px-4 py-2 font-bold shadow hover:scale-105 transition transform"
              >
                View on MyAnimeList
              </a>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex justify-center items-center bg-background border-2 border-primary text-primary rounded px-4 py-2 font-bold hover:bg-primary/10 transition"
              >
                Watch (Sample Episode)
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimeDetailModal;
