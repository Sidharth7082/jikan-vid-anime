
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageDetailModal } from "./ImageDetailModal";

const POST_LIMIT = 20;

interface Post {
  id: number;
  preview_file_url: string;
  large_file_url: string;
  file_url: string;
  tag_string_general: string;
  tag_string_artist: string;
  tag_string_copyright: string;
  tag_string_character: string;
  tag_string_meta: string;
  rating: string;
}

const DanbooruGallery = ({ currentSearch, onTagClick }: { currentSearch: string, onTagClick: (tag: string) => void }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const searchRef = useRef(currentSearch);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async (searchTags: string, pageNum: number) => {
    setLoading(true);
    try {
      const response = await axios.get("https://danbooru.donmai.us/posts.json", {
        params: {
          tags: searchTags,
          limit: POST_LIMIT,
          page: pageNum,
        },
      });

      const newPosts: Post[] = response.data.filter((p: any) => p.id && (p.preview_file_url || p.large_file_url));

      setHasMore(newPosts.length === POST_LIMIT);
      setPosts(newPosts);
    } catch (error) {
      toast({
        title: "Error fetching posts",
        description: "Could not load images from Danbooru.",
        variant: "destructive",
      });
      setHasMore(false);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (searchRef.current !== currentSearch) {
      searchRef.current = currentSearch;
      if (page === 1) {
        fetchPosts(currentSearch, 1);
      } else {
        setPage(1);
      }
    } else {
      fetchPosts(currentSearch, page);
    }
  }, [currentSearch, page, fetchPosts]);

  const handlePrevious = () => {
    if (page > 1 && !loading) {
      setPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[200px]">
        {loading ? (
          Array.from({ length: POST_LIMIT }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full h-auto rounded-lg" />)
        ) : (
          posts.map((post) => (
            <div 
              key={post.id} 
              className="group aspect-[3/4] bg-black/5 rounded-lg overflow-hidden border relative cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <img 
                src={post.preview_file_url || post.large_file_url} 
                alt={post.tag_string_general} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))
        )}
      </div>
      
      {!loading && posts.length === 0 && (
         <div className="text-center text-zinc-500 col-span-full py-10">
            <p>No results found. Try different tags!</p>
         </div>
      )}

      {!loading && posts.length > 0 && (page > 1 || hasMore) && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button 
                  variant="ghost" 
                  size="default" 
                  onClick={handlePrevious} 
                  disabled={page === 1 || loading}
                  className="gap-1 pl-2.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 font-medium text-sm text-zinc-700">Page {page}</span>
              </PaginationItem>
              <PaginationItem>
                <Button 
                  variant="ghost" 
                  size="default" 
                  onClick={handleNext} 
                  disabled={!hasMore || loading}
                  className="gap-1 pr-2.5"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {selectedPost && (
        <ImageDetailModal 
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedPost(null);
            }
          }}
          onTagClick={onTagClick}
        />
      )}
    </>
  );
};

export default DanbooruGallery;
