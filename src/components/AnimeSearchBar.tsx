import React, { useState, useRef } from "react";
import { searchAnime } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (anime: any | null) => void;
  className?: string;
  wrapperClass?: string;
  placeholder?: string;
}

const AnimeSearchBar: React.FC<Props> = ({ onSelect, className, wrapperClass, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchRes = await searchAnime(val);
        setResults(searchRes.slice(0, 8));
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
    onSelect(null);
  };

  return (
    <div className={cn("relative w-full max-w-lg mx-auto mb-2", className)}>
      <div className={cn("flex items-center bg-card/75 rounded-lg border px-2 py-1 shadow focus-within:ring-2 ring-[#e50914] backdrop-blur", wrapperClass)}>
        <Search className="text-muted-foreground mr-2" size={20} />
        <Input
          value={query}
          onChange={handleInput}
          placeholder={placeholder || "Search anime (e.g. Naruto, Attack on Titan)…"}
          className="!border-0 bg-transparent font-medium text-base focus:ring-0 focus-visible:ring-0"
          autoFocus={false}
          aria-label="Search anime"
        />
        {query ? (
          <Button size="icon" variant="ghost" onClick={handleReset} className="ml-1" aria-label="Clear">
            <X size={18} />
          </Button>
        ) : null}
        {loading && (
          <Loader2 className="animate-spin ml-2 text-muted-foreground" size={18} />
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 right-0 bg-popover/90 shadow-lg rounded-lg mt-1 z-30 animate-fade-in overflow-hidden max-h-72 border border-card/35 backdrop-blur-lg">
          {results.map((anime) => (
            <button
              key={anime.mal_id}
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(anime);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 w-full text-left border-b border-border/25 last-of-type:border-b-0 transition",
                "hover:bg-secondary/90 focus:bg-secondary focus:outline-none focus-visible:ring-2 ring-[#e50914]"
              )}
              tabIndex={0}
            >
              <img
                src={
                  anime.images?.webp?.image_url ||
                  anime.images?.jpg?.image_url ||
                  ""
                }
                alt={anime.title}
                className="w-10 h-14 object-cover rounded shadow bg-zinc-900"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "/placeholder.svg")
                }
              />
              <span className="font-semibold line-clamp-1">
                {anime.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeSearchBar;
