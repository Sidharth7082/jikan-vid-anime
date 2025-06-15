
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const POST_LIMIT = 20;

interface Post {
  id: number;
  preview_file_url: string;
  large_file_url: string;
  tag_string_general: string;
  rating: string;
}

const DanbooruGallery = ({ currentSearch }: { currentSearch: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchPosts = useCallback(async (searchTags: string, pageNum: number, loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPosts([]);
    }

    try {
      const response = await axios.get("https://danbooru.donmai.us/posts.json", {
        params: {
          tags: searchTags,
          limit: POST_LIMIT,
          page: pageNum,
        },
      });

      const newPosts: Post[] = response.data.filter((p: any) => p.id && p.preview_file_url);

      if (newPosts.length < POST_LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setPosts(prev => loadMore ? [...prev, ...newPosts] : newPosts);
    } catch (error) {
      toast({
        title: "Error fetching posts",
        description: "Could not load images from Danbooru.",
        variant: "destructive",
      });
      setHasMore(false);
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts(currentSearch, 1);
    setPage(1);
    setHasMore(true);
  }, [currentSearch, fetchPosts]);

  const handleLoadMore = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchPosts(currentSearch, newPage, true);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[200px]">
        {loading ? (
          Array.from({ length: POST_LIMIT }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full h-auto rounded-lg" />)
        ) : (
          posts.map((post) => (
            <div key={post.id} className="group aspect-[3/4] bg-black/5 rounded-lg overflow-hidden border relative">
              <img src={post.preview_file_url} alt={post.tag_string_general} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
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

      {!loading && posts.length > 0 && hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}
    </>
  );
};

export default DanbooruGallery;
