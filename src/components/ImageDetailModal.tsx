
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import axios from 'axios';

interface Post {
  id: number;
  large_file_url: string;
  tag_string_general: string;
  tag_string_artist: string;
  tag_string_copyright: string;
  tag_string_character: string;
  tag_string_meta: string;
  rating: string;
}

interface ImageDetailModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagClick: (tag: string) => void;
}

const TagSection = ({ title, tags, onTagClick }: { title: string, tags: string, onTagClick: (tag: string) => void }) => {
  if (!tags) return null;
  const tagArray = tags.split(' ').filter(t => t);
  if (tagArray.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-zinc-500 mb-2 capitalize">{title.replace(/_/g, ' ')}</h4>
      <div className="flex flex-wrap gap-1">
        {tagArray.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => onTagClick(tag)}
            title={`Add tag: ${tag}`}
          >
            {tag.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ post, open, onOpenChange, onTagClick }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  if (!post) return null;

  const handleDownload = async () => {
    if (!post.large_file_url) {
        toast({
            title: "Download failed",
            description: "No high-resolution image available for this post.",
            variant: "destructive",
        });
        return;
    }
    setIsDownloading(true);
    try {
        const response = await axios.get(post.large_file_url, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileExtension = post.large_file_url.split('.').pop() || 'jpg';
        link.setAttribute('download', `danbooru_${post.id}.${fileExtension}`);
        document.body.appendChild(link);
        link.click();
        
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download error:", error);
        toast({
            title: "Download failed",
            description: "Could not download the image. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleTagClickAndClose = (tag: string) => {
    onTagClick(tag);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] overflow-hidden flex-1">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <DialogHeader>
                <DialogTitle>Image Details</DialogTitle>
              </DialogHeader>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4">
                <TagSection title="Artist" tags={post.tag_string_artist} onTagClick={handleTagClickAndClose} />
                <TagSection title="Copyright" tags={post.tag_string_copyright} onTagClick={handleTagClickAndClose} />
                <TagSection title="Character" tags={post.tag_string_character} onTagClick={handleTagClickAndClose} />
                <TagSection title="General" tags={post.tag_string_general} onTagClick={handleTagClickAndClose} />
                <TagSection title="Meta" tags={post.tag_string_meta} onTagClick={handleTagClickAndClose} />
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-zinc-500 mb-2">Information</h4>
                  <p className="text-sm font-mono bg-zinc-100 px-2 py-1 rounded-md inline-block">ID: {post.id}</p>
                  <p className="text-sm mt-2">Rating: <Badge variant={post.rating === 's' ? 'default' : post.rating === 'q' ? 'secondary' : 'destructive'}>{post.rating === 's' ? 'Safe' : post.rating === 'q' ? 'Questionable' : 'Explicit'}</Badge></p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="link" asChild className="p-0 h-auto text-sm">
                      <a href={`https://danbooru.donmai.us/posts/${post.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        View on Danbooru <ExternalLink size={14} />
                      </a>
                    </Button>
                    <Button variant="link" onClick={handleDownload} disabled={isDownloading} className="p-0 h-auto text-sm flex items-center gap-1 text-primary">
                      {isDownloading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
          <div className="h-full flex items-center justify-center bg-black/90 overflow-hidden">
             {post.large_file_url ? (
                <img src={post.large_file_url} alt={post.tag_string_general} className="w-full h-full object-contain" />
              ) : (
                <div className="text-white">Image not available</div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
