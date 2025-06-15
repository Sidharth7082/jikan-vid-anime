
import React, { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const RATINGS = ["safe", "suggestive", "borderline", "explicit"] as const;

interface NekosImage {
  id: string;
  url: string;
  file_url: string;
  rating: string;
  width: number;
  height: number;
  tags?: { name: string }[];
}

// Utility to build query string with array params
function buildQuery(params: { [key: string]: any }) {
  const query = [];
  for (const key in params) {
    if (params[key] == null || params[key] === "" || (Array.isArray(params[key]) && params[key].length === 0)) continue;
    if (Array.isArray(params[key])) {
      params[key].forEach((v: string) => query.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
    } else {
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  return query.length ? "?" + query.join("&") : "";
}

const tagsPresets = [
  ["catgirl", "kemonomimi"],
  ["maid"],
  ["school_uniform"],
  ["kimono"],
  ["blush"],
  ["solo"],
  ["tail"],
  ["long_hair"],
];

export default function NekosApiGallery() {
  const [images, setImages] = useState<NekosImage[]>([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [selectedRatings, setSelectedRatings] = useState<string[]>(["safe"]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingRandom, setUsingRandom] = useState(false);

  // Unified load function for /images and /images/random
  const fetchImages = async (useRandom = false) => {
    setLoading(true);
    setUsingRandom(useRandom);
    setImages([]); // clear current
    const params: Record<string, any> = {
      limit: Math.max(1, Math.min(limit, 30)),
      offset: useRandom ? undefined : offset,
    };
    if (selectedRatings.length > 0) params.rating = selectedRatings;
    if (tags.length > 0) params.tags = tags;
    const query = buildQuery(params);
    try {
      const endpoint = useRandom ? "https://api.nekosapi.com/v4/images/random" : "https://api.nekosapi.com/v4/images";
      const res = await fetch(endpoint + query);
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data.items || []);
    } catch (err) {
      setImages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Load "safe" images by default
    fetchImages(false);
    // eslint-disable-next-line
  }, []);

  // Tag input handler (comma-separated)
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (!val) setTags([]);
    else setTags(val.split(",").map((t) => t.trim()).filter(Boolean));
  };

  // Helper to toggle rating
  const toggleRating = (r: string) => {
    setSelectedRatings((prev) =>
      prev.includes(r) ? prev.filter((_r) => _r !== r) : [...prev, r]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 w-full">
      <section className="mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-zinc-400 font-medium pr-1">Ratings:</label>
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              className={`px-2 py-[2px] rounded text-xs border ${
                selectedRatings.includes(r)
                  ? "bg-gradient-to-r from-pink-700 via-red-700 to-pink-900 text-white shadow"
                  : "bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800/50"
                } transition font-semibold`}
              onClick={() => toggleRating(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-2 md:mt-0">
          <label className="text-sm text-zinc-400 font-medium pr-1">Tags:</label>
          <input
            type="text"
            className="rounded border border-zinc-600 bg-black/60 px-2 py-1 text-xs text-white w-48 focus:outline-none focus:ring-2 focus:ring-[#e50914]/80"
            placeholder="comma,separated,tags"
            onChange={handleTagInput}
            value={tags.join(",")}
            aria-label="tags (comma-separated)"
          />
          <div className="flex gap-2">
            {tagsPresets.map((preset, i) => (
              <button
                key={i}
                className="text-zinc-400 border border-zinc-900 rounded bg-zinc-900/70 px-2 py-[1.5px] text-xs hover:text-white hover:bg-gradient-to-r from-pink-700 to-red-700 transition"
                onClick={() => setTags(preset)}
                type="button"
              >
                {preset.join(", ")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-2 md:mt-0">
          <label htmlFor="limit" className="text-sm text-zinc-400 pr-1">Limit:</label>
          <input
            type="number"
            id="limit"
            min={1}
            max={30}
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="rounded w-16 px-2 py-1 text-xs border border-zinc-600 bg-black/60 text-white"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            size="sm"
            className="bg-gradient-to-r from-pink-700 to-red-500 text-white"
            onClick={() => fetchImages(false)}
            disabled={loading}
          >
            <ImageIcon className="w-4 h-4" />Search Images
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-pink-800 to-violet-700 text-white"
            onClick={() => fetchImages(true)}
            disabled={loading}
          >
            <ImageIcon className="w-4 h-4" />Random Images
          </Button>
        </div>
      </section>
      <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {loading
          ? [...Array(limit)].map((_, idx) => (
              <Skeleton key={idx} className="aspect-square w-full rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-800/80" />
            ))
          : images.length === 0
            ? <div className="col-span-full text-zinc-400 text-center p-10">No images found.</div>
            : images.map(img => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden shadow-lg border border-zinc-700 group bg-zinc-900/80 hover:scale-105 transition-transform flex flex-col items-center"
                >
                  <img
                    src={img.file_url}
                    alt={img.tags?.map(t => t.name).join(", ") || "nekosapi image"}
                    className="w-full aspect-square object-cover"
                    style={{
                      background: "#222",
                      minHeight: 160,
                      maxHeight: 320,
                    }}
                  />
                  <div className="px-3 py-2 text-xs text-zinc-300 w-full flex flex-wrap gap-2">
                    {img.tags?.slice(0, 4).map(tag => (
                      <span
                        key={tag.name}
                        className="rounded bg-zinc-800/80 px-2 py-0.5 text-pink-300 font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-500 w-full pl-3 pb-2">Rating: {img.rating}</div>
                </div>
              ))}
      </div>
      <div className="flex w-full justify-center items-center gap-4 mt-8">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          disabled={loading || offset === 0 || usingRandom}
        >
          Prev
        </Button>
        <span className="text-xs text-zinc-400">Page: {Math.floor(offset / limit) + 1}</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOffset((o) => o + limit)}
          disabled={loading || usingRandom}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
