
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Video, Subtitles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  anime: any | null;
}

const AnimeDetailModal: React.FC<Props> = ({ open, onOpenChange, anime }) => {
  const [episode, setEpisode] = useState(1);
  const [streamType, setStreamType] = useState<"sub" | "dub">("sub");

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePlayerEvent = (event: MessageEvent) => {
      // For security, only accept messages from the video player's origin
      if (event.origin !== "https://vidsrc.cc") {
        return;
      }

      if (event.data && event.data.type === "PLAYER_EVENT") {
        console.log("Player Event Received:", event.data.data);
        // This can be expanded later to track user watch progress.
      }
    };

    window.addEventListener("message", handlePlayerEvent);

    return () => {
      window.removeEventListener("message", handlePlayerEvent);
    };
  }, [open]);

  if (!anime) return null;
  const mainId = anime.mal_id;

  // Max episode fallback: Try episode count or guess
  const totalEpisodes = anime.episodes || 24;

  const embedUrl = `https://vidsrc.cc/v2/embed/anime/${mainId}/${episode}/${streamType}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl sm:max-w-3xl w-full overflow-y-auto animate-fade-in font-sans bg-gradient-to-br from-[#19191eeb] via-[#101112ea] to-[#18181ebf] shadow-[0_12px_40px_0_rgba(18,16,39,0.94)] border border-[#232324] rounded-2xl p-0
        backdrop-blur-lg"
        style={{ minHeight: 600 }}
      >
        {/* Header */}
        <DialogHeader className="bg-gradient-to-br from-[#1d1c20fc] to-[#17181aeb] rounded-t-2xl p-6 pb-4">
          <div className="flex items-center mb-1 gap-3">
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" aria-label="Back to List">
              <ArrowLeft size={22} />
            </Button>
            <DialogTitle className="text-3xl font-black mb-1 text-white tracking-tight" style={{letterSpacing: "-1.2px"}}>
              {anime.title ?? "Anime"}
            </DialogTitle>
            <span className="flex-1"/>
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" aria-label="Close detail">
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-7 px-6 pb-6 sm:pb-8 pt-3 sm:pt-4">
          <img
            src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || "/placeholder.svg"}
            alt={anime.title}
            className="rounded-xl object-cover shadow-xl w-44 h-64 mx-auto md:mx-0 border-2 border-[#222223] bg-zinc-900 flex-shrink-0"
            loading="lazy"
            onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
          />
          {/* Right: Details + streaming */}
          <div className="flex-1 min-w-0 text-white flex flex-col gap-3 md:gap-5">
            <div>
              <DialogDescription asChild>
                <p className="line-clamp-6 mb-3 text-neutral-200 leading-relaxed font-medium" style={{ textShadow: "0 0 12px #18181866" }}>
                  {anime.synopsis || "No synopsis available."}
                </p>
              </DialogDescription>
              <div className="flex flex-wrap gap-2 mb-3">
                {anime.genres?.map((g: any) => (
                  <span className="bg-[#232323] text-[#f3f3f3] px-2 py-0.5 text-xs rounded" key={g.name}>
                    {g.name}
                  </span>
                ))}
                {anime.rating && (
                  <span className="bg-[#232323] px-2 py-0.5 rounded text-xs text-neutral-200">{anime.rating}</span>
                )}
                {anime.score && (
                  <span className="bg-[#e50914] ml-2 text-white rounded px-2 py-0.5 font-bold text-xs animate-fade-in shadow shadow-[#e50914]/30 tracking-wide drop-shadow">
                    ★ {anime.score}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant={streamType === "sub" ? "default" : "ghost"}
                  onClick={() => setStreamType("sub")}
                  size="sm"
                  className="flex gap-2"
                  aria-pressed={streamType === "sub"}
                >
                  <Subtitles size={17} /> SUB
                </Button>
                <Button
                  variant={streamType === "dub" ? "default" : "ghost"}
                  onClick={() => setStreamType("dub")}
                  size="sm"
                  className="flex gap-2"
                  aria-pressed={streamType === "dub"}
                >
                  <Video size={17} /> DUB
                </Button>
              </div>
            </div>
            <div>
              {/* Video Player */}
              <div className="relative mt-4 aspect-video w-full rounded-xl overflow-hidden border-2 border-[#202023] shadow-lg bg-zinc-900/80">
                <iframe
                  title={`${anime.title} episode ${episode} ${streamType}`}
                  src={embedUrl}
                  loading="lazy"
                  allow="fullscreen"
                  allowFullScreen
                  className="w-full h-full min-h-[240px] bg-black"
                  style={{ minHeight: 320, borderRadius: 12 }}
                />
                <span className="absolute left-2 top-2 bg-black/50 px-2 py-0.5 text-white font-bold text-xs rounded shadow">
                  Watch: Ep. {episode} / {totalEpisodes} ({streamType.toUpperCase()})
                </span>
              </div>
              {/* Episode Selector */}
              <div className="flex flex-wrap gap-1 mt-3 max-h-28 overflow-x-auto animate-fade-in custom-scrollbar">
                {Array.from(
                  { length: totalEpisodes > 40 ? 40 : totalEpisodes || 0 },
                  (_, i) => i + 1
                ).map((epNum) => (
                  <Button
                    key={epNum}
                    variant={epNum === episode ? "secondary" : "ghost"}
                    className={cn(
                      "p-1 h-7 text-xs w-9 font-bold",
                      epNum === episode ? "ring-2 ring-[#e50914]" : ""
                    )}
                    onClick={() => setEpisode(epNum)}
                    aria-current={epNum === episode}
                  >
                    {epNum}
                  </Button>
                ))}
                {totalEpisodes > 40 && (
                  <span className="px-3 py-1 text-xs text-slate-200/70">…</span>
                )}
              </div>
              {/* Source Button */}
              <div className="flex gap-2 mt-5 justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-bold"
                >
                  <a
                    href={anime.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on MyAnimeList
                  </a>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="font-bold"
                >
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ▶ Direct Stream Link
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimeDetailModal;
