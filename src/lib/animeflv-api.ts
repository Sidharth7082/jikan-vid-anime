
const ANIMEFLV_BASE_URL = "https://animeflv-api-backend.onrender.com";

export interface VideoSource {
  type: "embed" | "direct" | "unknown";
  url: string;
  label?: string;
}

export interface AnimeSearchResult {
  id: string;
  title: string;
  poster: string;
  type: string;
  status: string;
}

export async function searchAnimeFlv(query: string): Promise<AnimeSearchResult[]> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search anime");
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("AnimeFlv search error:", error);
    return [];
  }
}

export async function getVideoSources(animeId: string, episodeNumber: number): Promise<VideoSource[]> {
  try {
    const response = await fetch(`${ANIMEFLV_BASE_URL}/api/video-sources/${animeId}/${episodeNumber}`);
    if (!response.ok) throw new Error("Failed to fetch video sources");
    const data = await response.json();
    return data.sources || [];
  } catch (error) {
    console.error("AnimeFlv video sources error:", error);
    return [];
  }
}

export function getVidSrcUrl(malId: number, episodeNumber: number): string {
  return `https://vidsrc.to/embed/tv/${malId}/${episodeNumber}`;
}
