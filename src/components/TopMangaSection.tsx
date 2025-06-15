
import React, { useEffect, useState, useCallback } from 'react';
import { fetchTopManga } from "@/lib/api";
import MangaCard from "@/components/MangaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { BookMarked } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TopMangaSection = () => {
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<any>(null);

  const loadTopManga = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await fetchTopManga(page);
      setMangaList(result.data);
      setPaginationInfo(result.pagination);
      // Removed window.scrollTo(0,0) as it can be jarring.
      // The user can scroll up if they wish.
    } catch (e) {
      toast({
        title: "Failed to fetch top manga.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTopManga(currentPage);
  }, [currentPage, loadTopManga]);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && paginationInfo && page <= paginationInfo.last_visible_page) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (!paginationInfo) return null;

    const { current_page, last_visible_page } = paginationInfo;
    const pages = [];
    const pageLimit = 5;
    const middle = Math.ceil(pageLimit / 2);
    let start = current_page - middle + 1;
    let end = start + pageLimit - 1;

    if (start < 1) {
      start = 1;
      end = Math.min(pageLimit, last_visible_page);
    }

    if (end > last_visible_page) {
      end = last_visible_page;
      start = Math.max(1, end - pageLimit + 1);
    }

    if (start > 1) {
      pages.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink href="#" isActive={i === current_page} onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (end < last_visible_page) {
      pages.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
    }

    return pages;
  }

  return (
    <div id="top-manga" className="max-w-7xl mx-auto w-full px-3 sm:px-8">
      <div className="flex items-start md:items-center justify-between mt-12 mb-6 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
                <BookMarked className="text-purple-600 w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Top Manga</h2>
                <p className="text-zinc-500">The highest-rated manga on MyAnimeList</p>
            </div>
        </div>
      </div>
      {loading ? (
        <section className="mt-4 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(25)].map((_, idx) => (
            <Skeleton key={idx} className="rounded-lg w-full h-[350px] bg-zinc-200" />
          ))}
        </section>
      ) : (
        <>
          <section className="mt-2 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mangaList.map((manga: any) => (
              <MangaCard
                key={manga.mal_id}
                manga={manga}
                onClick={() => toast({ description: `Opening details for ${manga.title}` })}
              />
            ))}
          </section>
          {paginationInfo && paginationInfo.last_visible_page > 1 && (
            <div className="mt-8 flex justify-center pb-8">
              <Pagination>
                <PaginationContent>
                  {paginationInfo.has_previous_page && (
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                    </PaginationItem>
                  )}
                  {renderPagination()}
                  {paginationInfo.has_next_page && (
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopMangaSection;
