
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ListType = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';

export interface UserFavorite {
  id: string;
  user_id: string;
  anime_id: number;
  anime_title: string;
  anime_image_url?: string;
  list_type: ListType;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFavorites((data || []).map(item => ({
        ...item,
        list_type: item.list_type as ListType
      })));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error fetching favorites",
        description: "Could not load your anime list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (anime: any, listType: ListType) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .upsert({
          user_id: user.id,
          anime_id: anime.mal_id,
          anime_title: anime.title || anime.title_english || anime.title_romaji,
          anime_image_url: anime.images?.jpg?.image_url || anime.image_url,
          list_type: listType,
        });

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Added to list",
        description: `${anime.title || anime.title_english} added to ${listType.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error adding to list",
        description: "Could not add anime to your list.",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (animeId: number) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('anime_id', animeId);

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Removed from list",
        description: "Anime removed from your list",
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error removing from list",
        description: "Could not remove anime from your list.",
        variant: "destructive",
      });
    }
  };

  const updateFavorite = async (animeId: number, updates: Partial<UserFavorite>) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .update(updates)
        .eq('anime_id', animeId);

      if (error) throw error;
      
      await fetchFavorites();
      toast({
        title: "Updated",
        description: "Anime list updated successfully",
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error updating",
        description: "Could not update anime in your list.",
        variant: "destructive",
      });
    }
  };

  const getFavoriteByAnimeId = (animeId: number) => {
    return favorites.find(fav => fav.anime_id === animeId);
  };

  const getFavoritesByListType = (listType: ListType) => {
    return favorites.filter(fav => fav.list_type === listType);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    getFavoriteByAnimeId,
    getFavoritesByListType,
    refetch: fetchFavorites,
  };
};
