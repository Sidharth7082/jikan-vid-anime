import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

const OtakuGifsGallery = () => {
  const [reactions, setReactions] = useState<string[]>([]);
  const [selectedReaction, setSelectedReaction] = useState<string>("");
  const [gifUrl, setGifUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingReactions, setLoadingReactions] = useState(true);
  const { toast } = useToast();

  const fetchReactions = useCallback(async () => {
    try {
      const result = await axios.get(
        "https://api.otakugifs.xyz/gif/allreactions"
      );
      if (result.data && result.data.reactions) {
        setReactions(result.data.reactions);
        const defaultReaction = "kiss";
        if (result.data.reactions.includes(defaultReaction)) {
          setSelectedReaction(defaultReaction);
        } else if (result.data.reactions.length > 0) {
          setSelectedReaction(result.data.reactions[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Error fetching reactions",
        description: "Could not load the list of GIF reactions.",
        variant: "destructive",
      });
    } finally {
      setLoadingReactions(false);
    }
  }, [toast]);

  const fetchGif = useCallback(
    async (reaction: string) => {
      if (!reaction) return;
      setLoading(true);
      setGifUrl("");
      try {
        const result = await axios.get(
          `https://api.otakugifs.xyz/gif?reaction=${reaction}`
        );
        if (result.data && result.data.url) {
          setGifUrl(result.data.url);
        } else {
          throw new Error("No URL in response");
        }
      } catch (error) {
        toast({
          title: "Error fetching GIF",
          description: "Could not load a GIF for the selected reaction.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  useEffect(() => {
    if (selectedReaction) {
      fetchGif(selectedReaction);
    }
  }, [selectedReaction, fetchGif]);

  const handleGetNewGif = () => {
    fetchGif(selectedReaction);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 border border-zinc-200/80 rounded-2xl bg-white/60 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <h3 className="text-lg font-semibold text-zinc-800 shrink-0">
            Reaction:
          </h3>
          {loadingReactions ? (
            <Skeleton className="h-10 w-full flex-1" />
          ) : (
            <Select onValueChange={setSelectedReaction} value={selectedReaction}>
              <SelectTrigger className="w-full flex-1 sm:w-48">
                <SelectValue placeholder="Select reaction" />
              </SelectTrigger>
              <SelectContent>
                {reactions.map((reaction) => (
                  <SelectItem key={reaction} value={reaction}>
                    {reaction.charAt(0).toUpperCase() + reaction.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleGetNewGif}
            disabled={loading || !selectedReaction}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </div>
      <div className="w-full max-w-lg h-80 flex items-center justify-center bg-black/5 rounded-lg overflow-hidden border">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : gifUrl ? (
          <img
            src={gifUrl}
            alt={selectedReaction}
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="text-zinc-500 p-4 text-center">
            {loadingReactions
              ? "Loading reactions..."
              : "Select a reaction to see a GIF."}
          </div>
        )}
      </div>
    </div>
  );
};

export default OtakuGifsGallery;
