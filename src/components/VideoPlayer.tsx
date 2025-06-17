
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface VideoSource {
  type: "embed" | "direct" | "unknown";
  url: string;
}

interface ConsolidatedSource extends VideoSource {
  id: string;
  name: string;
  priority: number;
}

interface VideoPlayerProps {
  animeTitle: string;
  animeMalId: number;
  episodeNumber: number;
}

const ANIMEFLV_BASE_URL = "https://animeflv-api-backend.onrender.com";

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  animeTitle,
  animeMalId,
  episodeNumber
}) => {
  const [sources, setSources] = useState<ConsolidatedSource[]>([]);
  const [currentSource, setCurrentSource] = useState<ConsolidatedSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [animeFlvId, setAnimeFlvId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const searchAnimeFlv = async (query: string) => {
    try {
      const response = await fetch(`${ANIMEFLV_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search anime");
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("AnimeFlv search error:", error);
      return [];
    }
  };

  const getVideoSources = async (animeId: string, episodeNumber: number) => {
    try {
      const response = await fetch(`${ANIMEFLV_BASE_URL}/api/video-sources/${animeId}/${episodeNumber}`);
      if (!response.ok) throw new Error("Failed to fetch video sources");
      const data = await response.json();
      return data.sources || [];
    } catch (error) {
      console.error("AnimeFlv video sources error:", error);
      return [];
    }
  };

  const loadAndPlayEpisode = async () => {
    setLoading(true);
    setStatus("Loading sources...");
    setSources([]);
    setCurrentSource(null);

    try {
      // Search for anime in AnimeFlv to get the ID
      setStatus("Searching for anime...");
      const searchResults = await searchAnimeFlv(animeTitle);
      const animeFlvResult = searchResults[0]; // Take first result
      
      if (!animeFlvResult) {
        setStatus("Anime not found in AnimeFlv database.");
        return;
      }

      console.log("Found anime:", animeFlvResult);
      setAnimeFlvId(animeFlvResult.id);
      
      setStatus("Fetching video sources...");
      const animeFlvSources = await getVideoSources(animeFlvResult.id, episodeNumber);
      
      // Create consolidated sources from AnimeFlv API
      const consolidatedSources: ConsolidatedSource[] = animeFlvSources.map((source: VideoSource, index: number) => ({
        id: `animeflv-${index}`,
        name: `Source ${index + 1} (${source.type.toUpperCase()})`,
        type: source.type,
        url: source.url,
        priority: source.type === 'embed' ? 1 : source.type === 'direct' ? 2 : 3
      }));

      // Sort by priority (embed first, then direct, then unknown)
      consolidatedSources.sort((a, b) => a.priority - b.priority);
      setSources(consolidatedSources);

      if (consolidatedSources.length > 0) {
        setStatus("Sources loaded successfully!");
        // Auto-play the highest priority source
        playSource(consolidatedSources[0]);
      } else {
        setStatus("No sources found for this episode.");
      }
    } catch (error) {
      console.error("Error loading episode:", error);
      setStatus("Failed to load sources. Please try again.");
      toast({
        title: "Error loading video",
        description: "Could not fetch video sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const playSource = (source: ConsolidatedSource) => {
    setCurrentSource(source);
    
    // Hide both players first
    if (videoRef.current) {
      videoRef.current.style.display = 'none';
      videoRef.current.pause();
    }
    if (iframeRef.current) {
      iframeRef.current.style.display = 'none';
    }

    if (source.type === 'direct') {
      // Use HTML5 video for direct sources
      if (videoRef.current) {
        videoRef.current.src = source.url;
        videoRef.current.style.display = 'block';
        videoRef.current.load();
        
        // Try to autoplay
        videoRef.current.play().catch(() => {
          setStatus("Autoplay failed. Click play button to start.");
        });
      }
    } else {
      // Use iframe for embed sources
      if (iframeRef.current) {
        iframeRef.current.src = source.url;
        iframeRef.current.style.display = 'block';
      }
    }

    setStatus(`Trying to play ${source.type} source...`);
  };

  // Load sources when component mounts or episode changes
  useEffect(() => {
    loadAndPlayEpisode();
  }, [animeTitle, animeMalId, episodeNumber]);

  return (
    <div className="w-full">
      {/* Video Player Area */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-[#202023] shadow-lg bg-zinc-900/80">
        {/* HTML5 Video Player */}
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          style={{ display: 'none' }}
          onError={() => setStatus("Video failed to load. Try another source.")}
        />
        
        {/* Iframe Player */}
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          allow="fullscreen"
          allowFullScreen
          style={{ display: 'none' }}
          onError={() => setStatus("Embed failed to load. Try another source.")}
        />
        
        {/* Loading/Status Overlay */}
        {(loading || !currentSource) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
            <div className="text-center">
              {loading && <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />}
              <p className="text-sm">{status}</p>
            </div>
          </div>
        )}
        
        {/* Episode Info Overlay */}
        <div className="absolute left-2 top-2 bg-black/50 px-2 py-0.5 text-white font-bold text-xs rounded shadow">
          Episode {episodeNumber}
        </div>
      </div>

      {/* Status Message */}
      {status && !loading && (
        <div className="mt-3 text-sm text-gray-300 text-center">
          {status}
        </div>
      )}

      {/* Source Selection Buttons - Compact Layout */}
      {sources.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {sources.map((source) => (
              <Button
                key={source.id}
                variant={currentSource?.id === source.id ? "default" : "outline"}
                size="sm"
                onClick={() => playSource(source)}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg transition-colors duration-200"
              >
                {source.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Retry Button */}
      {!loading && sources.length === 0 && (
        <div className="mt-4 text-center">
          <Button onClick={loadAndPlayEpisode} variant="outline" size="sm">
            <Loader2 className="w-4 h-4 mr-2" />
            Retry Loading Sources
          </Button>
        </div>
      )}
    </div>
  );
};
