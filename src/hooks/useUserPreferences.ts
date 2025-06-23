
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Theme = 'light' | 'dark' | 'auto';

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: Theme;
  preferred_genres?: string[];
  notification_settings: {
    email: boolean;
    push: boolean;
  };
  privacy_settings: {
    profile_public: boolean;
    favorites_public: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          ...data,
          theme: data.theme as Theme,
          notification_settings: data.notification_settings as { email: boolean; push: boolean },
          privacy_settings: data.privacy_settings as { profile_public: boolean; favorites_public: boolean }
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setPreferences({
          ...data,
          theme: data.theme as Theme,
          notification_settings: data.notification_settings as { email: boolean; push: boolean },
          privacy_settings: data.privacy_settings as { profile_public: boolean; favorites_public: boolean }
        });
      }
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error updating preferences",
        description: "Could not save your preferences.",
        variant: "destructive",
      });
    }
  };

  const updateTheme = async (theme: Theme) => {
    await updatePreferences({ theme });
    
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // auto mode - check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Apply theme on load
  useEffect(() => {
    if (preferences?.theme) {
      const root = document.documentElement;
      if (preferences.theme === 'dark') {
        root.classList.add('dark');
      } else if (preferences.theme === 'light') {
        root.classList.remove('dark');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  }, [preferences?.theme]);

  return {
    preferences,
    loading,
    updatePreferences,
    updateTheme,
    refetch: fetchPreferences,
  };
};
