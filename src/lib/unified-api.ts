
const ANIMEFLV_API_BASE = 'https://animeflv-api-backend.onrender.com';
const VIDFAST_EMBED_BASE = 'https://vidfast.pro';

export interface UnifiedItem {
  source_type: 'Jikan' | 'IMDbAPI' | 'TMDB';
  content_type: 'anime' | 'movie' | 'tvSeries';
  mal_id?: string;
  imdb_id?: string;
  tmdb_id?: string;
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
  animeflv_id?: string;
}

export interface VideoSource {
  type: 'embed' | 'direct';
  url: string;
  provider: string;
}

export async function fetchUnifiedDetail(sourceType: string, itemId: string, contentType?: string): Promise<DetailedContent> {
  let url = `${ANIMEFLV_API_BASE}/api/unified-detail/${sourceType}/${itemId}`;
  if (contentType && sourceType === 'TMDB') {
    url += `?content_type_param=${contentType}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch unified detail: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function fetchVideoSources(animeFlvId: string, episodeNumber: number): Promise<VideoSource[]> {
  try {
    const response = await fetch(`${ANIMEFLV_API_BASE}/api/video-sources/${animeFlvId}/${episodeNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch video sources: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.sources?.map((source: any) => ({
      ...source,
      provider: 'Your API'
    })) || [];
  } catch (error) {
    console.error('Error fetching from AnimeFLV API:', error);
    return [];
  }
}

export function generateVidFastUrl(imdbId?: string, tmdbId?: string, contentType?: string, episodeNumber?: number): VideoSource | null {
  const id = imdbId || tmdbId;
  if (!id) return null;
  
  let url: string;
  if (contentType === 'movie') {
    url = `${VIDFAST_EMBED_BASE}/movie/${id}`;
  } else {
    const episode = episodeNumber || 1;
    url = `${VIDFAST_EMBED_BASE}/tv/${id}/1/${episode}`;
  }
  
  return {
    type: 'embed',
    url,
    provider: 'VidFast.pro'
  };
}

export async function consolidateVideoSources(
  animeFlvId?: string,
  imdbId?: string, 
  tmdbId?: string,
  contentType?: string,
  episodeNumber: number = 1
): Promise<VideoSource[]> {
  const sources: VideoSource[] = [];
  const seenUrls = new Set<string>();
  
  // Fetch from AnimeFLV API (priority)
  if (animeFlvId) {
    const apiSources = await fetchVideoSources(animeFlvId, episodeNumber);
    apiSources.forEach(source => {
      if (!seenUrls.has(source.url)) {
        sources.push(source);
        seenUrls.add(source.url);
      }
    });
  }
  
  // Add VidFast.pro as fallback
  const vidFastSource = generateVidFastUrl(imdbId, tmdbId, contentType, episodeNumber);
  if (vidFastSource && !seenUrls.has(vidFastSource.url)) {
    sources.push(vidFastSource);
    seenUrls.add(vidFastSource.url);
  }
  
  return sources;
}
