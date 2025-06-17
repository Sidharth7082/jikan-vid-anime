
const ANIMEFLV_BASE_URL = "https://animeflv-api-backend.onrender.com";

export interface VideoSource {
  type: "embed" | "direct" | "unknown";
  url: string;
}

export interface AnimeSearchResult {
  id: string;
  title: string;
  poster: string;
  banner: string;
  synopsis: string;
  rating: string;
  genres: string[];
  debut: string;
  type: string;
}

export interface AnimeInfo extends AnimeSearchResult {
  episodes: {
    id: string;
    anime: string;
    image_preview: string;
  }[];
}

export interface LatestEpisode {
  id: string;
  anime: string;
  image_preview: string;
}

export async function searchAnimeFlv(query: string, page?: number): Promise<AnimeSearchResult[]> {
  try {
    const url = page 
      ? `${ANIMEFLV_BASE_URL}/api/search?query=${encodeURIComponent(query)}&page=${page}`
      : `${ANIMEFLV_BASE_URL}/api/search?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search anime");
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("AnimeFlv search error:", error);
    return [];
  }
}

export async function getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/anime-info/${animeId}`);
    if (!response.ok) throw new Error("Failed to fetch anime info");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AnimeFlv anime info error:", error);
    return null;
  }
}

export async function getVideoSources(animeId: string, episodeNumber: number, format: 'subtitled' | 'dubbed' | 'both' = 'subtitled'): Promise<VideoSource[]> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/video-sources/${animeId}/${episodeNumber}?format=${format}`);
    if (!response.ok) throw new Error("Failed to fetch video sources");
    const data = await response.json();
    return data.sources || [];
  } catch (error) {
    console.error("AnimeFlv video sources error:", error);
    return [];
  }
}

export async function getLatestEpisodes(): Promise<LatestEpisode[]> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/latest-episodes`);
    if (!response.ok) throw new Error("Failed to fetch latest episodes");
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("AnimeFlv latest episodes error:", error);
    return [];
  }
}

export async function getLatestAnimes(): Promise<AnimeSearchResult[]> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/latest-animes`);
    if (!response.ok) throw new Error("Failed to fetch latest animes");
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("AnimeFlv latest animes error:", error);
    return [];
  }
}
