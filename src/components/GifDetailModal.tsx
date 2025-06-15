
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ExternalLink, Download, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from './ui/use-toast';

interface GifDetail {
  url: string;
  animeName?: string;
  sourceUrl?: string;
}

interface GifDetailModalProps {
  gif: GifDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GifDetailModal: React.FC<GifDetailModalProps> = ({ gif, open, onOpenChange }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  if (!gif) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await axios.get(gif.url, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = gif.url.split('.').pop() || 'gif';
      const fileName = gif.animeName ? `${gif.animeName.replace(/\s/g, '_')}.${fileExtension}` : `gif_${Date.now()}.${fileExtension}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not download the GIF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900/80 border-none shadow-2xl backdrop-blur-md max-w-4xl w-[90vw] p-0 text-white overflow-hidden">
        <div className="relative group flex justify-center items-center bg-black">
          <img src={gif.url} alt={gif.animeName || 'GIF'} className="w-auto h-auto object-contain max-h-[85vh] max-w-full" />
          
          <div className="absolute top-0 right-0 p-2 bg-gradient-to-l from-black/50 to-transparent">
             {gif.sourceUrl && (
              <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <a href={gif.sourceUrl} target="_blank" rel="noopener noreferrer" title="View source">
                  <ExternalLink size={20} />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isDownloading} className="text-white hover:bg-white/20" title="Download GIF">
              {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            </Button>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" title="Close">
                    <X size={20} />
                </Button>
            </DialogClose>
          </div>
          
          {gif.animeName && (
            <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/70 to-transparent w-full">
              <p className="text-lg font-bold drop-shadow-lg">Anime: {gif.animeName}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
