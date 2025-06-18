
import { fetchUnifiedAnimeDetails } from './unified-api';

const BASE_URL = "https://api.jikan.moe/v4";

export async function fetchTopAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/top/anime?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch top anime");
  const data = await res.json();
  return data;
}

export async function searchAnime(query: string) {
  if (!query.trim()) return [];
  const res = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&order_by=popularity&sfw=true`);
  if (!res.ok) throw new Error("Failed to search anime");
  const data = await res.json();
  return data.data;
}

export async function fetchAnimeDetails(malId: number): Promise<any> {
  try {
    // Use the unified API which prioritizes English content
    const response = await fetchUnifiedAnimeDetails(malId.toString());
    return response;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    // Fallback to direct Jikan API if unified fails
    try {
      const fallbackResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.data) {
        const anime = fallbackData.data;
        return {
          ...anime,
          title: anime.title_english || anime.title,
          synopsis: anime.synopsis || "No synopsis available."
        };
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    throw error;
  }
}

export async function fetchAnimeByLetter(letter: string, page = 1) {
  if (letter === "all") return fetchTopAnime(page);
  const res = await fetch(`${BASE_URL}/anime?letter=${letter}&page=${page}&order_by=title&sort=asc`);
  if (!res.ok) throw new Error(`Failed to fetch anime starting with letter ${letter}`);
  const data = await res.json();
  return data;
}

export async function fetchSeasonalAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/seasons/now?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch seasonal anime");
  const data = await res.json();
  return data;
}

export async function fetchTopManga(page = 1) {
  const res = await fetch(`${BASE_URL}/top/manga?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch top manga");
  const data = await res.json();
  return data;
}
