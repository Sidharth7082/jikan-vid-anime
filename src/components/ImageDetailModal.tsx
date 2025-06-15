import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Download, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
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
  created_at: string;
  score: number;
  source: string;
  image_width: number;
  image_height: number;
  file_size: number;
  fav_count: number;
  uploader_id: number;
}
interface ImageDetailModalProps {
  posts: Post[];
  initialIndex: number;
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

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const InformationSection = ({ post }: { post: Post }) => (
  <div className="mb-6">
    <h4 className="text-xl font-bold mb-3 capitalize text-zinc-300">Information</h4>
    <ul className="text-sm space-y-2 text-zinc-400">
      <li><strong>ID:</strong> {post.id}</li>
      <li><strong>Date:</strong> {new Date(post.created_at).toLocaleDateString()}</li>
      <li><strong>Size:</strong> {post.image_width}x{post.image_height} ({formatBytes(post.file_size)})</li>
      {post.source && <li><strong>Source:</strong> <a href={post.source} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{post.source.length > 30 ? post.source.slice(0, 30) + '...' : post.source}</a></li>}
      <li><strong>Rating:</strong> {post.rating.toUpperCase()}</li>
      <li><strong>Score:</strong> {post.score}</li>
      <li><strong>Favorites:</strong> {post.fav_count}</li>
      <li><strong>Uploader:</strong> {post.uploader_id}</li>
    </ul>
  </div>
);

const OptionsSection = ({ post, onDownload, isDownloading }: { post: Post; onDownload: () => void; isDownloading: boolean }) => (
  <div className="mb-6">
    <h4 className="text-xl font-bold mb-3 capitalize text-zinc-300">Options</h4>
    <div className="flex flex-col items-start gap-1">
       <Button variant="ghost" onClick={onDownload} disabled={isDownloading} size="sm" className="text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start w-full px-2 h-auto py-1.5">
           {isDownloading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
           <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
       </Button>
       <Button variant="ghost" size="sm" asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start w-full px-2 h-auto py-1.5">
         <a href={post.large_file_url} target="_blank" rel="noopener noreferrer">
           <ExternalLink size={16} className="mr-2" />
           <span>View Original</span>
         </a>
       </Button>
       <Button variant="ghost" size="sm" asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-white justify-start w-full px-2 h-auto py-1.5">
         <a href={`https://danbooru.donmai.us/posts/${post.id}`} target="_blank" rel="noopener noreferrer">
           <ExternalLink size={16} className="mr-2" />
           <span>View on Danbooru</span>
         </a>
       </Button>
    </div>
  </div>
);


export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  posts,
  initialIndex,
  open,
  onOpenChange,
  onTagClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, open]);
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % posts.length);
  }, [posts.length]);
  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + posts.length) % posts.length);
  }, [posts.length]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);
  const post = posts[currentIndex];
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
      <DialogContent className="max-w-screen-2xl w-[98vw] h-[98vh] p-0 gap-0 bg-zinc-900 border-zinc-800 text-zinc-50 overflow-hidden">
        <DialogTitle className="sr-only">Image Detail - {post.tag_string_artist || `Post ${post.id}`}</DialogTitle>
        <DialogDescription className="sr-only">{post.tag_string_general}</DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] h-full">
          <div className="h-full flex flex-col">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TagSection title="Artist" tags={post.tag_string_artist} onTagClick={handleTagClickAndClose} />
                <TagSection title="Copyright" tags={post.tag_string_copyright} onTagClick={handleTagClickAndClose} />
                <TagSection title="Character" tags={post.tag_string_character} onTagClick={handleTagClickAndClose} />
                <TagSection title="General" tags={post.tag_string_general} onTagClick={handleTagClickAndClose} />
                <TagSection title="Meta" tags={post.tag_string_meta} onTagClick={handleTagClickAndClose} />
                <InformationSection post={post} />
                <OptionsSection post={post} onDownload={handleDownload} isDownloading={isDownloading} />
              </div>
            </ScrollArea>
          </div>
          <div className="relative h-full bg-black flex items-center justify-center">
             {posts.length > 1 && <>
                <Button onClick={handlePrev} variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-16 w-16 text-white/50 hover:text-white hover:bg-black/20 rounded-full">
                  <ArrowLeft size={32} />
                  <span className="sr-only">Previous Image</span>
                </Button>
                <Button onClick={handleNext} variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-16 w-16 text-white/50 hover:text-white hover:bg-black/20 rounded-full">
                  <ArrowRight size={32} />
                  <span className="sr-only">Next Image</span>
                </Button>
              </>}
            <ScrollArea className="h-full w-full">
              <div className="flex min-h-full items-center justify-center p-4">
                {post.large_file_url ? <img src={post.large_file_url} alt={post.tag_string_general} className="max-w-full max-h-[96vh] object-contain transition-opacity duration-300" key={post.id} /> : <div className="text-white">Image not available</div>}
              </div>
            </ScrollArea>
             {posts.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
                    {currentIndex + 1} / {posts.length}
                </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
