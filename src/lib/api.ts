
const BASE_URL = "https://api.jikan.moe/v4";

export async function fetchTopAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/top/anime?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch top anime");
  const data = await res.json();
  return data.data;
}

export async function searchAnime(query: string) {
  if (!query.trim()) return [];
  const res = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&order_by=popularity&sfw=true`);
  if (!res.ok) throw new Error("Failed to search anime");
  const data = await res.json();
  return data.data;
}

export async function fetchAnimeDetails(id: number | string) {
  const res = await fetch(`${BASE_URL}/anime/${id}/full`);
  if (!res.ok) throw new Error("Failed to fetch anime details");
  const data = await res.json();
  return data.data;
}
