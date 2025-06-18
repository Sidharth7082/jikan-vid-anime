const ANIMEFLV_API_BASE = 'https://animeflv.ahmedrangel.com/api';

export interface UnifiedItem {
  source_type: 'Jikan';
  content_type: 'anime';
  mal_id?: string;
  title: string;
  poster?: string;
  image_url?: string;
  synopsis?: string;
  episodes_count?: number;
  status?: string;
  score?: number;
  genres?: string[];
  release_year?: number;
}

export interface DetailedContent extends UnifiedItem {
  animeflv_id?: string; // This will be the slug
}

export interface VideoSource {
  url: string;
  type: 'embed' | 'direct';
  quality?: string;
  provider: string;
}

async function searchAnimeOnAnimeFLV(query: string): Promise<any[]> {
  const searchUrl = `${ANIMEFLV_API_BASE}/search?query=${encodeURIComponent(query)}`;
  console.log(`Searching AnimeFLV for: ${query}`);
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`AnimeFLV search failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success || !data.data || !data.data.media) {
      console.warn('AnimeFLV search returned no media:', data);
      return [];
    }
    return data.data.media;
  } catch (error) {
    console.error('Error in searchAnimeOnAnimeFLV:', error);
    return [];
  }
}

export async function fetchUnifiedDetail(sourceType: string, itemId: string, title: string): Promise<DetailedContent> {
  if (sourceType !== 'Jikan' || !title) {
    throw new Error('This function currently only supports searching by title from a Jikan source.');
  }

  console.log(`Attempting to find '${title}' on AnimeFLV...`);
  const searchResults = await searchAnimeOnAnimeFLV(title);

  if (searchResults.length === 0) {
    throw new Error(`No results found for "${title}" on AnimeFLV.`);
  }

  const bestMatch = searchResults[0];
  const slug = bestMatch.slug;

  if (!slug) {
    throw new Error(`Could not find a valid slug for "${title}" on AnimeFLV.`);
  }
  
  console.log(`Found slug '${slug}' for '${title}'. Fetching details...`);
  const detailUrl = `${ANIMEFLV_API_BASE}/anime/${slug}`;

  try {
    const response = await fetch(detailUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch details from AnimeFLV for slug: ${slug}`);
    }
    const detailsData = await response.json();

    if (!detailsData.success) {
      throw new Error(`AnimeFLV API returned success=false for slug: ${slug}`);
    }
    
    const animeData = detailsData.data;
    
    const unifiedDetails: DetailedContent = {
      source_type: 'Jikan',
      content_type: 'anime',
      mal_id: itemId,
      animeflv_id: slug, // The slug is our AnimeFLV ID
      title: animeData.title,
      poster: animeData.cover,
      synopsis: animeData.synopsis,
      episodes_count: animeData.episodes?.length || 0,
      status: animeData.status,
      score: parseFloat(animeData.rating) || undefined,
      genres: animeData.genres,
      release_year: parseInt(animeData.debut) || undefined
    };
    
    console.log('Successfully unified details from AnimeFLV:', unifiedDetails);
    return unifiedDetails;

  } catch (error) {
    console.error('Error fetching or processing AnimeFLV details:', error);
    throw error;
  }
}

export async function fetchVideoSources(animeFlvId: string, episodeNumber: number): Promise<VideoSource[]> {
  if (!animeFlvId) {
    console.error('No AnimeFLV ID (slug) provided to fetchVideoSources');
    return [];
  }

  const url = `${ANIMEFLV_API_BASE}/anime/${animeFlvId}/episode/${episodeNumber}`;
  console.log('Fetching video sources from:', url);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video sources: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Video sources response:', data);
    
    if (!data.success || !data.data || !data.data.servers) {
      console.error('Invalid sources data received from AnimeFLV:', data);
      return [];
    }
    
    return data.data.servers.map((source: any) => ({
      url: source.embed,
      type: 'embed',
      quality: source.name,
      provider: 'AnimeFLV'
    })).filter((s: VideoSource) => s.url);
  } catch (error) {
    console.error('Error in fetchVideoSources:', error);
    return [];
  }
}

export async function consolidateVideoSources(
  animeFlvId?: string,
  episodeNumber: number = 1
): Promise<VideoSource[]> {
  if (!animeFlvId) {
    console.warn('No AnimeFLV ID provided to consolidateVideoSources');
    return [];
  }
  
  console.log(`Fetching video sources for AnimeFLV ID: ${animeFlvId}, Episode: ${episodeNumber}`);
  return await fetchVideoSources(animeFlvId, episodeNumber);
}

export const fetchUnifiedAnimeDetails = async (malId: string): Promise<any> => {
  try {
    console.log(`Loading content details for MAL ID: ${malId}`);
    
    // First, get the basic anime details from Jikan (which is in English)
    const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    const jikanData = await jikanResponse.json();
    
    if (!jikanData.data) {
      throw new Error('Anime not found');
    }

    const anime = jikanData.data;
    
    // Prepare the unified response with English content from Jikan
    const unifiedResponse = {
      source_type: "Jikan",
      content_type: "anime",
      mal_id: malId,
      title: anime.title || anime.title_english || "Unknown Title",
      title_english: anime.title_english || anime.title,
      title_japanese: anime.title_japanese,
      poster: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
      synopsis: anime.synopsis || "No synopsis available.",
      episodes_count: anime.episodes || 0,
      status: anime.status || "Unknown",
      score: anime.score || 0,
      genres: anime.genres?.map((g: any) => g.name) || [],
      release_year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "Unknown",
      type: anime.type || "TV",
      duration: anime.duration,
      rating: anime.rating,
      studios: anime.studios?.map((s: any) => s.name) || [],
      aired: anime.aired,
      broadcast: anime.broadcast,
      producers: anime.producers?.map((p: any) => p.name) || [],
      licensors: anime.licensors?.map((l: any) => l.name) || [],
    };

    // Try to get additional streaming info from AnimeFLV but keep English as primary language
    try {
      const title = anime.title || anime.title_english;
      console.log(`Attempting to find '${title}' on AnimeFLV for streaming options...`);
      
      const animeflvResponse = await fetch(`https://api.consumet.org/anime/animeflv/${encodeURIComponent(title)}`);
      
      if (animeflvResponse.ok) {
        const animeflvData = await animeflvResponse.json();
        
        if (animeflvData.results && animeflvData.results.length > 0) {
          const match = animeflvData.results[0];
          console.log(`Found streaming option: ${match.id}`);
          
          // Add streaming info but keep English content
          unifiedResponse.animeflv_id = match.id;
          unifiedResponse.streaming_available = true;
          
          // Only use AnimeFLV poster if Jikan doesn't have one
          if (!unifiedResponse.poster && match.image) {
            unifiedResponse.poster = match.image;
          }
        }
      }
    } catch (streamingError) {
      console.log('Streaming info not available, using Jikan data only');
    }

    console.log('Successfully unified details with English content prioritized');
    return unifiedResponse;
    
  } catch (error) {
    console.error('Error fetching unified anime details:', error);
    throw error;
  }
};
