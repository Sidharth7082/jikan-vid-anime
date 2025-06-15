
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
const tagColors: {
  [key: string]: string;
} = {
  artist: 'text-red-400',
  copyright: 'text-green-400',
  character: 'text-purple-400',
  general: 'text-blue-400',
  meta: 'text-yellow-500'
};
const TagSection = ({
  title,
  tags,
  onTagClick
}: {
  title: string;
  tags: string;
  onTagClick: (tag: string) => void;
}) => {
  if (!tags) return null;
  const tagArray = tags.split(' ').filter(t => t);
  if (tagArray.length === 0) return null;
  const titleKey = title.toLowerCase();
  return <div className="mb-6">
      <h4 className={`text-xl font-bold mb-3 capitalize ${tagColors[titleKey] || 'text-zinc-300'}`}>{title.replace(/_/g, ' ')}</h4>
      <div className="flex flex-wrap gap-2">
        {tagArray.map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer rounded-md bg-zinc-700/60 hover:bg-zinc-700/90 text-zinc-300 hover:text-white transition-colors py-1 px-3" onClick={() => onTagClick(tag)} title={`Add tag: ${tag}`}>
            {tag.replace(/_/g, ' ')}
          </Badge>)}
      </div>
    </div>;
};
export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  post,
  open,
  onOpenChange,
  onTagClick
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    toast
  } = useToast();
  if (!post) return null;
  const handleDownload = async () => {
    if (!post.large_file_url) {
      toast({
        title: "Download failed",
        description: "No high-resolution image available for this post.",
        variant: "destructive"
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
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  const handleTagClickAndClose = (tag: string) => {
    onTagClick(tag);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 bg-zinc-900 border-zinc-800 text-zinc-50 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-full">
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-zinc-800">
               <h3 className="text-2xl font-bold mb-4">Post Details</h3>
               <div className="flex items-center flex-wrap gap-4">
                  <Button variant="link" asChild className="p-0 h-auto text-zinc-300 hover:text-white flex items-center gap-2 hover:no-underline">
                    <a href={`https://danbooru.donmai.us/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
                      View on Danbooru
                      <ExternalLink size={16} />
                    </a>
                  </Button>
                  <Button variant="outline" onClick={handleDownload} disabled={isDownloading} size="sm" className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">
                      {isDownloading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
                      {isDownloading ? 'Downloading...' : 'Download'}
                  </Button>
               </div>
            </div>
            <ScrollArea className="h-full">
              <div className="p-6">
                <TagSection title="Artist" tags={post.tag_string_artist} onTagClick={handleTagClickAndClose} />
                <TagSection title="Copyright" tags={post.tag_string_copyright} onTagClick={handleTagClickAndClose} />
                <TagSection title="Character" tags={post.tag_string_character} onTagClick={handleTagClickAndClose} />
                <TagSection title="General" tags={post.tag_string_general} onTagClick={handleTagClickAndClose} />
                <TagSection title="Meta" tags={post.tag_string_meta} onTagClick={handleTagClickAndClose} />
              </div>
            </ScrollArea>
          </div>
          <div className="h-full flex items-center justify-center bg-black overflow-hidden">
             {post.large_file_url ? <img src={post.large_file_url} alt={post.tag_string_general} className="w-full h-full object-contain" /> : <div className="text-white">Image not available</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
