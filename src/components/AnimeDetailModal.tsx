
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  anime: any | null;
}

const AnimeDetailModal: React.FC<Props> = ({ open, onOpenChange, anime }) => {
  if (!anime) return null;
  const mainId = anime.mal_id;
  const episodeExample = 1;
  // Demo embed, Netflix would use their own player!
  const embedUrl = `https://vidsrc.cc/v2/embed/anime/${mainId}/${episodeExample}/sub`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-2xl w-full overflow-y-auto animate-fade-in font-sans bg-gradient-to-br from-[#19191e] via-[#101112] to-[#18181e] shadow-[0_12px_40px_0_rgba(18,16,39,0.92)] border-2 border-[#232324] rounded-2xl p-0">
        <DialogHeader className="bg-gradient-to-br from-[#1d1c20] to-[#17181a] rounded-t-2xl p-6 pb-4">
          <DialogTitle className="text-3xl font-black mb-1 text-white tracking-tight" style={{letterSpacing: "-1.2px"}}>
            {anime.title ?? "Anime"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-8 px-6 pb-6">
          <img
            src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="rounded-xl object-cover shadow-xl w-44 h-60 mx-auto sm:mx-0 border-2 border-[#222223]"
            loading="lazy"
          />
          <div className="flex-1 min-w-0 text-white">
            <p className="line-clamp-6 mb-4 text-neutral-200 leading-relaxed font-medium" style={{ textShadow: "0 0 10px #18181866" }}>
              {anime.synopsis}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres?.map((g: any) => (
                <span className="bg-[#232323] text-[#f3f3f3] px-2 py-0.5 text-xs rounded" key={g.name}>
                  {g.name}
                </span>
              ))}
              {anime.rating && (
                <span className="bg-[#232323] px-2 py-0.5 rounded text-xs text-neutral-200">{anime.rating}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <a
                href={anime.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center bg-[#e50914] text-white rounded px-6 py-2 font-bold shadow hover:bg-[#e50918] transition"
                style={{ letterSpacing: "1px" }}
              >
                View on MyAnimeList
              </a>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center bg-[rgba(23,24,31,0.95)] text-[#e50914] border border-[#e50914] rounded px-6 py-2 font-bold hover:bg-[#e50914] hover:text-white transition"
                style={{ letterSpacing: "1px" }}
              >
                ▶ Watch Demo Episode
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimeDetailModal;
