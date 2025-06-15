import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Images as ImagesIcon, RefreshCw, Search } from "lucide-react";
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

type ImageProvider = "nekosapi" | "nekosbest" | "danbooru";

interface NekosBestCategory {
  format: "png" | "gif";
}

// Helper for nekos.best to get all endpoints/categories
async function fetchNekosBestEndpoints(): Promise<Record<string, NekosBestCategory>> {
  try {
    const res = await fetch("https://nekos.best/api/v2/endpoints");
    const data = await res.json();
    return data || {};
  } catch {
    return {};
  }
}

// Used for nekos.best asset type
interface NekosBestAsset {
  url: string;
  anime_name?: string;
  artist_name?: string;
  artist_href?: string;
  source_url?: string;
}

export default function NekosApiGallery() {
  // General states
  const [provider, setProvider] = useState<ImageProvider>("nekosapi");

  // --- NekosAPI states ---
  const [images, setImages] = useState<NekosImage[]>([]);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [selectedRatings, setSelectedRatings] = useState<string[]>(["safe"]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingRandom, setUsingRandom] = useState(false);

  // --- nekos.best new states ---
  const [nekosBestCategories, setNekosBestCategories] = useState<Record<string, NekosBestCategory>>({});
  const [nekosBestType, setNekosBestType] = useState<"png" | "gif" | "all">("all");
  const [nekosBestCategory, setNekosBestCategory] = useState<string>("neko");
  const [nekosBestAssets, setNekosBestAssets] = useState<NekosBestAsset[]>([]);
  const [nekosBestSearch, setNekosBestSearch] = useState("");
  const [nekosBestAmount, setNekosBestAmount] = useState(6);
  const [nekosBestLoading, setNekosBestLoading] = useState(false);

  // --- Danbooru new states ---
  const [danbooruTags, setDanbooruTags] = useState<string[]>([]);
  const [danbooruPage, setDanbooruPage] = useState(1);

  // --- UI provider switch ---
  useEffect(() => {
    // On switching provider, clear results/lists
    setImages([]);
    setNekosBestAssets([]);
    setLoading(false);
    setNekosBestLoading(false);
  }, [provider]);

  // --- NekosAPI logic ---
  useEffect(() => {
    if (provider === "nekosapi") {
      fetchImages(false);
    }
    // eslint-disable-next-line
  }, [provider]);
  
  // --- Danbooru logic ---
  useEffect(() => {
    if (provider === "danbooru") {
      fetchDanbooruPosts(1);
    }
    // eslint-disable-next-line
  }, [provider]);


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

  // Danbooru fetch function
  const fetchDanbooruPosts = async (page = 1) => {
    setLoading(true);
    setImages([]);
    const DANBOORU_API_KEY = "68dypdaxX8QEP4ycshpMdPbN";
    const DANBOORU_LOGIN = "capture04";
    const limit = 12;

    const ratingMap: { [key: string]: string } = {
      safe: "g",
      suggestive: "s",
      borderline: "q",
      explicit: "e",
    };
    const selectedDanbooruRatings = selectedRatings.map(r => `rating:${ratingMap[r]}`).filter(Boolean);

    const tags = [...danbooruTags, ...selectedDanbooruRatings].join(' ');

    try {
        const res = await fetch(`https://danbooru.donmai.us/posts.json?login=${DANBOORU_LOGIN}&api_key=${DANBOORU_API_KEY}&tags=${encodeURIComponent(tags)}&page=${page}&limit=${limit}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: "Failed to fetch from Danbooru" }));
            throw new Error(errorData.message || "Failed to fetch from Danbooru");
        }
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          console.error("Danbooru API error:", data.message);
          throw new Error(data.message || "Failed to fetch from Danbooru");
        }

        const mappedImages: NekosImage[] = data.map((post: any) => ({
            id: post.id.toString(),
            url: post.large_file_url || post.file_url,
            file_url: post.large_file_url || post.file_url,
            rating: Object.keys(ratingMap).find(key => ratingMap[key] === post.rating) || 'safe',
            width: post.image_width,
            height: post.image_height,
            tags: post.tag_string.split(" ").map((name: string) => ({ name })),
        })).filter((img: NekosImage) => img.file_url);

        setImages(mappedImages);
        setDanbooruPage(page);
    } catch(err) {
        console.error(err);
        setImages([]);
    } finally {
        setLoading(false);
    }
  }

  // Tag input handler (comma-separated)
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (!val) setTags([]);
    else setTags(val.split(",").map((t) => t.trim()).filter(Boolean));
  };

  const handleDanbooruTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (!val) setDanbooruTags([]);
    else setDanbooruTags(val.split(",").map((t) => t.trim().replace(/ /g, "_")).filter(Boolean));
  };


  // Helper to toggle rating
  const toggleRating = (r: string) => {
    setSelectedRatings((prev) =>
      prev.includes(r) ? prev.filter((_r) => _r !== r) : [...prev, r]
    );
  };

  // --- nekos.best endpoint logic ---
  useEffect(() => {
    if (provider !== "nekosbest") return;
    async function load() {
      setNekosBestLoading(true);
      const endpoints = await fetchNekosBestEndpoints();
      setNekosBestCategories(endpoints);
      // Default to first PNG category, fallback to 'neko'
      if (!nekosBestCategory || !endpoints[nekosBestCategory]) {
        const firstPng = Object.keys(endpoints).find(k => endpoints[k].format === "png") || "neko";
        setNekosBestCategory(firstPng);
      }
      setNekosBestLoading(false);
    }
    load();
    // eslint-disable-next-line
  }, [provider]);

  // Get all available categories for current filter
  const nekosBestAvailableCategories = Object.entries(nekosBestCategories).filter(
    ([, val]) =>
      nekosBestType === "all" || val.format === nekosBestType
  );

  const nekosBestCategoryList = nekosBestAvailableCategories.map(([k]) => k);

  // Fetch nekos.best assets by category
  async function handleNekosBestGet() {
    setNekosBestLoading(true);
    setNekosBestAssets([]);
    let url = `https://nekos.best/api/v2/${nekosBestCategory}?amount=${nekosBestAmount}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setNekosBestAssets(data.results || []);
    } catch {
      setNekosBestAssets([]);
    }
    setNekosBestLoading(false);
  }

  // Search nekos.best by query
  async function handleNekosBestSearch() {
    if (!nekosBestSearch.trim()) return;
    setNekosBestLoading(true);
    setNekosBestAssets([]);
    let url = `https://nekos.best/api/v2/search?query=${encodeURIComponent(nekosBestSearch)}&amount=${nekosBestAmount}`;
    if (nekosBestType !== "all") {
      url += `&type=${nekosBestType === "png" ? 1 : 2}`;
    }
    if (nekosBestCategory) {
      url += `&category=${nekosBestCategory}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setNekosBestAssets(data.results || []);
    } catch {
      setNekosBestAssets([]);
    }
    setNekosBestLoading(false);
  }

  // UI for switching provider
  return (
    <div className="max-w-6xl mx-auto p-4 w-full">
      {/* Provider Switch */}
      <section className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white px-2">Provider:</span>
          <Button
            variant={provider === "nekosapi" ? "default" : "secondary"}
            className={provider === "nekosapi"
              ? "bg-gradient-to-r from-pink-700 to-red-500 text-white font-semibold"
              : ""}
            onClick={() => setProvider("nekosapi")}
            size="sm"
          >
            <ImagesIcon className="w-4 h-4 mr-1" />NekosAPI
          </Button>
          <Button
            variant={provider === "nekosbest" ? "default" : "secondary"}
            className={provider === "nekosbest"
              ? "bg-gradient-to-r from-blue-700 to-violet-600 text-white font-semibold"
              : ""}
            onClick={() => setProvider("nekosbest")}
            size="sm"
          >
            <ImagesIcon className="w-4 h-4 mr-1" />nekos.best
          </Button>
          <Button
            variant={provider === "danbooru" ? "default" : "secondary"}
            className={provider === "danbooru"
              ? "bg-gradient-to-r from-green-600 to-teal-500 text-white font-semibold"
              : ""}
            onClick={() => setProvider("danbooru")}
            size="sm"
          >
            <ImagesIcon className="w-4 h-4 mr-1" />Danbooru
          </Button>
        </div>
        <div className="hidden md:block text-xs text-zinc-400 pr-2">Switch to your favorite SFW anime image & GIF provider</div>
      </section>

      {/* NekosAPI branch */}
      {provider === "nekosapi" && (
        <>
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
        </>
      )}
      
      {/* Danbooru branch */}
      {provider === "danbooru" && (
        <>
          <section className="mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-sm text-zinc-400 font-medium pr-1">Ratings:</label>
              {RATINGS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`px-2 py-[2px] rounded text-xs border ${
                    selectedRatings.includes(r)
                      ? "bg-gradient-to-r from-green-700 via-blue-700 to-green-900 text-white shadow"
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
                className="rounded border border-zinc-600 bg-black/60 px-2 py-1 text-xs text-white w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/80"
                placeholder="comma,separated,tags"
                onChange={handleDanbooruTagInput}
                value={danbooruTags.join(",")}
                aria-label="tags (comma-separated)"
                onKeyUp={e => { if (e.key === "Enter") fetchDanbooruPosts(1); }}
              />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-700 to-blue-500 text-white"
                onClick={() => fetchDanbooruPosts(1)}
                disabled={loading}
              >
                <Search className="w-4 h-4 mr-1" />Search Images
              </Button>
            </div>
          </section>
          <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {loading
              ? [...Array(12)].map((_, idx) => (
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
                        alt={img.tags?.map(t => t.name).join(", ") || "danbooru image"}
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
                            className="rounded bg-zinc-800/80 px-2 py-0.5 text-teal-300 font-medium"
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
              onClick={() => fetchDanbooruPosts(Math.max(1, danbooruPage - 1))}
              disabled={loading || danbooruPage === 1}
            >
              Prev
            </Button>
            <span className="text-xs text-zinc-400">Page: {danbooruPage}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fetchDanbooruPosts(danbooruPage + 1)}
              disabled={loading || images.length < 12}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* nekos.best branch */}
      {provider === "nekosbest" && (
        <section className="rounded-xl border border-zinc-700 bg-gradient-to-br from-[#101425] via-[#192040]/80 to-[#19192c]/90 shadow-xl px-2 py-5 md:py-6 relative flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Type: All, Images only, GIFs only */}
            <label className="text-sm text-zinc-300 font-medium">Show:</label>
            <Button
              size="sm"
              variant={nekosBestType === "all" ? "default" : "secondary"}
              className={nekosBestType === "all" ? "bg-gradient-to-r from-blue-500 to-violet-900 text-white" : ""}
              onClick={() => setNekosBestType("all")}
            >All</Button>
            <Button
              size="sm"
              variant={nekosBestType === "png" ? "default" : "secondary"}
              className={nekosBestType === "png" ? "bg-gradient-to-r from-yellow-500 to-pink-500 text-white" : ""}
              onClick={() => setNekosBestType("png")}
            >Images</Button>
            <Button
              size="sm"
              variant={nekosBestType === "gif" ? "default" : "secondary"}
              className={nekosBestType === "gif" ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white" : ""}
              onClick={() => setNekosBestType("gif")}
            >GIFs</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Category selector */}
            <label className="text-sm text-zinc-300 font-medium pr-1">Category:</label>
            <select
              className="rounded border border-zinc-600 bg-black/60 px-2 py-1 text-xs text-white min-w-[120px] focus:outline-none focus:ring-2 focus:ring-violet-600"
              value={nekosBestCategory}
              onChange={e => setNekosBestCategory(e.target.value)}
            >
              {nekosBestCategoryList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label htmlFor="nekos-best-amount" className="text-sm text-zinc-400 pr-1">Amount:</label>
            <input
              id="nekos-best-amount"
              type="number"
              min={1}
              max={20}
              value={nekosBestAmount}
              onChange={e => setNekosBestAmount(Number(e.target.value))}
              className="rounded w-16 px-2 py-1 text-xs border border-zinc-600 bg-black/60 text-white"
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-700 to-violet-800 text-white"
              onClick={handleNekosBestGet}
              disabled={nekosBestLoading || !nekosBestCategory}
            >
              <RefreshCw className="w-4 h-4 mr-1" />Get
            </Button>
            {/* Search Query UI */}
            <input
              type="text"
              className="rounded border border-zinc-600 bg-black/60 px-2 py-1 text-xs text-white w-48 focus:outline-none focus:ring-2 focus:ring-blue-600/80"
              placeholder="search phrase (e.g. artist/source)"
              value={nekosBestSearch}
              onChange={e => setNekosBestSearch(e.target.value)}
              onKeyUp={e => { if (e.key === "Enter") handleNekosBestSearch(); }}
              aria-label="search in nekos.best"
            />
            <Button
              size="sm"
              variant="secondary"
              className="border border-zinc-700 text-zinc-300 hover:text-white flex gap-1"
              disabled={nekosBestLoading || !nekosBestSearch.trim()}
              onClick={handleNekosBestSearch}
            ><Search className="w-4 h-4" />Search</Button>
          </div>
          <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {nekosBestLoading
              ? [...Array(nekosBestAmount)].map((_, idx) => (
                  <Skeleton key={idx} className="aspect-square w-full rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-800/80" />
                ))
              : nekosBestAssets.length === 0
                ? <div className="col-span-full text-zinc-400 text-center p-10">No images found.</div>
                : nekosBestAssets.map((img, i) => (
                  <div
                    key={img.url + i}
                    className="rounded-xl overflow-hidden shadow-lg border border-zinc-700 group bg-zinc-900/80 hover:scale-105 transition-transform flex flex-col items-center"
                  >
                    <img
                      src={img.url}
                      alt={img.anime_name || img.artist_name || "nekos.best image"}
                      className="w-full aspect-square object-cover"
                      style={{
                        background: "#222",
                        minHeight: 160,
                        maxHeight: 320,
                      }}
                    />
                    <div className="px-3 py-2 text-xs text-zinc-200 w-full flex flex-wrap gap-2">
                      {img.anime_name && (
                        <span className="rounded bg-blue-900/80 px-2 py-0.5 text-cyan-300 font-medium">
                          {img.anime_name}
                        </span>
                      )}
                      {img.artist_name && (
                        <a
                          href={img.artist_href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-zinc-900/60 px-2 py-0.5 text-pink-300 font-medium underline hover:text-pink-400 transition"
                        >
                          {img.artist_name}
                        </a>
                      )}
                    </div>
                    {img.source_url && (
                      <div className="text-[10px] text-zinc-400 w-full pl-3 pb-2">
                        <a
                          href={img.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-300 transition"
                        >
                          Source
                        </a>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </section>
      )}
    </div>
  );
}
