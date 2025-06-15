
import React, { useState } from "react";
import { searchAnime } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Props {
  onSelect: (anime: any) => void;
}

const AnimeSearchBar: React.FC<Props> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const searchRes = await searchAnime(e.target.value);
      setResults(searchRes.slice(0, 8));
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <Input
        value={query}
        onChange={handleInput}
        placeholder="Search anime (e.g. Naruto)..."
        className="pl-4 pr-4 py-2 text-lg rounded-lg shadow bg-card border"
        autoFocus={false}
      />
      {loading && <Loader2 className="animate-spin absolute right-3 top-3 w-5 h-5 text-muted-foreground" />}
      {results.length > 0 && (
        <div className="absolute left-0 right-0 bg-popover shadow-lg rounded-lg mt-1 z-30 animate-fade-in overflow-hidden max-h-72">
          {results.map((anime) => (
            <button
              key={anime.mal_id}
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(anime);
              }}
              className="flex items-center gap-3 p-2 hover:bg-secondary w-full transition text-left border-b last-of-type:border-b-0"
              tabIndex={0}
            >
              <img
                src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                className="w-10 h-14 object-cover rounded shadow"
              />
              <span className="font-semibold line-clamp-1">{anime.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeSearchBar;
