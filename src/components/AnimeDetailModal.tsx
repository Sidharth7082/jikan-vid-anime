
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MoreHorizontal } from "lucide-react";

interface AnimeDetailModalProps {
  anime: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnimeDetailModal = ({ anime, open, onOpenChange }: AnimeDetailModalProps) => {
  // Return early if no anime data
  if (!anime) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Loading anime details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const genres = anime.genres?.map((genre: any) => genre.name).join(', ') || 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <FavoriteButton anime={anime} className="w-full" />
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold">{anime.title}</h1>
            <p className="text-gray-500">{anime.title_english || anime.title_japanese}</p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <span className="font-medium">Rank:</span> {anime.rank}
              </Badge>
              <Badge variant="secondary">
                <span className="font-medium">Score:</span> {anime.score}
              </Badge>
              <Badge variant="secondary">
                <span className="font-medium">Year:</span> {new Date(anime.aired?.from).getFullYear()}
              </Badge>
              <Badge variant="secondary">
                <span className="font-medium">Status:</span> {anime.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Synopsis</h3>
              <p className="text-gray-700">{anime.synopsis}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700"><span className="font-medium">Type:</span> {anime.type}</p>
                  <p className="text-gray-700"><span className="font-medium">Episodes:</span> {anime.episodes}</p>
                  <p className="text-gray-700"><span className="font-medium">Duration:</span> {anime.duration}</p>
                </div>
                <div>
                  <p className="text-gray-700"><span className="font-medium">Genres:</span> {genres}</p>
                  <p className="text-gray-700"><span className="font-medium">Rating:</span> {anime.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimeDetailModal;
