
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, Plus, Check, Star } from "lucide-react";
import { useFavorites, ListType } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  anime: any;
  className?: string;
}

const listTypeLabels: Record<ListType, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  dropped: "Dropped",
  on_hold: "On Hold",
};

const listTypeColors: Record<ListType, string> = {
  watching: "text-green-600",
  completed: "text-blue-600",
  plan_to_watch: "text-yellow-600",
  dropped: "text-red-600",
  on_hold: "text-gray-600",
};

export const FavoriteButton = ({ anime, className }: FavoriteButtonProps) => {
  const { addToFavorites, removeFromFavorites, getFavoriteByAnimeId } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentFavorite = getFavoriteByAnimeId(anime.mal_id);
  const isInList = !!currentFavorite;

  const handleAddToList = async (listType: ListType) => {
    setIsLoading(true);
    await addToFavorites(anime, listType);
    setIsLoading(false);
  };

  const handleRemoveFromList = async () => {
    setIsLoading(true);
    await removeFromFavorites(anime.mal_id);
    setIsLoading(false);
  };

  if (isInList) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className={cn(
              "gap-2",
              listTypeColors[currentFavorite.list_type],
              className
            )}
          >
            <Check className="w-4 h-4" />
            {listTypeLabels[currentFavorite.list_type]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.entries(listTypeLabels).map(([type, label]) => (
            <DropdownMenuItem
              key={type}
              onClick={() => handleAddToList(type as ListType)}
              className={cn(
                currentFavorite.list_type === type && "bg-accent"
              )}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={handleRemoveFromList}
            className="text-red-600"
          >
            Remove from List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className={cn("gap-2", className)}
        >
          <Plus className="w-4 h-4" />
          Add to List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(listTypeLabels).map(([type, label]) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleAddToList(type as ListType)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
