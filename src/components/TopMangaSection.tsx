import React, { useState, useEffect } from "react";
import { fetchTopManga } from "@/lib/api";
import MangaCard from "./MangaCard";

interface Manga {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  title: string;
  rank: number;
  score: number;
  scored_by: number;
  start_date: string;
  end_date: string | null;
  chapters: number | null;
  volumes: number | null;
  status: string;
  type: string;
  synopsis: string;
  background: string | null;
  authors: Array<{ mal_id: number; type: string; name: string; url: string }>;
  serializations: Array<{ mal_id: number; type: string; name: string; url: string }>;
  genres: Array<{ mal_id: number; type: string; name: string; url: string }>;
  explicit_genres: Array<{ mal_id: number; type: string; name: string; url: string }>;
  themes: Array<{ mal_id: number; type: string; name: string; url: string }>;
  demographics: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

const TopMangaSection: React.FC = () => {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopManga = async () => {
      setLoading(true);
      try {
        const result = await fetchTopManga();
        setMangaList(result.data);
      } catch (e) {
        console.error("Failed to fetch top manga:", e);
      }
      setLoading(false);
    };

    loadTopManga();
  }, []);

  if (loading) {
    return (
      <section className="py-8 px-3 sm:px-8 bg-[#0b1426]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-[#1f2937] rounded-lg aspect-[3/4] mb-3"></div>
                <div className="bg-[#1f2937] h-4 rounded mb-2"></div>
                <div className="bg-[#1f2937] h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-3 sm:px-8 bg-[#0b1426]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Completed Anime</h2>
          <button className="text-[#ffb800] hover:text-[#ff9500] font-medium text-sm transition-colors">
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mangaList.map((manga) => (
            <MangaCard
              key={manga.mal_id}
              manga={manga}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopMangaSection;
