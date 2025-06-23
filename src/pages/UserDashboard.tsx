
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites, ListType } from "@/hooks/useFavorites";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import NavBar from "@/components/NavBar";
import { User, TrendingUp, Clock, CheckCircle, Pause, X } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Session } from "@supabase/supabase-js";

const listTypeIcons: Record<ListType, any> = {
  watching: TrendingUp,
  completed: CheckCircle,
  plan_to_watch: Clock,
  dropped: X,
  on_hold: Pause,
};

const listTypeColors: Record<ListType, string> = {
  watching: "text-green-600 bg-green-50",
  completed: "text-blue-600 bg-blue-50",
  plan_to_watch: "text-yellow-600 bg-yellow-50",
  dropped: "text-red-600 bg-red-50",
  on_hold: "text-gray-600 bg-gray-50",
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, getFavoritesByListType } = useFavorites();
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSearch = (anime: any) => {
    if (anime) {
      navigate("/");
    }
  };

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center bg-[#181520] text-white">Loading...</div>;
  }

  const stats = {
    watching: getFavoritesByListType('watching').length,
    completed: getFavoritesByListType('completed').length,
    plan_to_watch: getFavoritesByListType('plan_to_watch').length,
    dropped: getFavoritesByListType('dropped').length,
    on_hold: getFavoritesByListType('on_hold').length,
  };

  const totalAnime = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-[#181520]">
      <NavBar onSearch={handleSearch} />
      <div className="text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <User className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-gray-400">Welcome back, {session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(stats).map(([listType, count]) => {
              const Icon = listTypeIcons[listType as ListType];
              return (
                <Card key={listType} className="bg-[#211F2D] border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${listTypeColors[listType as ListType]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{count}</p>
                        <p className="text-xs text-gray-400 capitalize">{listType.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="watching" className="space-y-6">
            <TabsList className="bg-[#211F2D] border-gray-700">
              <TabsTrigger value="watching">Watching ({stats.watching})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              <TabsTrigger value="plan_to_watch">Plan to Watch ({stats.plan_to_watch})</TabsTrigger>
              <TabsTrigger value="on_hold">On Hold ({stats.on_hold})</TabsTrigger>
              <TabsTrigger value="dropped">Dropped ({stats.dropped})</TabsTrigger>
            </TabsList>

            {Object.keys(stats).map(listType => (
              <TabsContent key={listType} value={listType}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {getFavoritesByListType(listType as ListType).map(favorite => (
                    <Card key={favorite.id} className="bg-[#211F2D] border-gray-700 overflow-hidden">
                      <div className="aspect-[2/3] relative">
                        <img
                          src={favorite.anime_image_url || '/placeholder.svg'}
                          alt={favorite.anime_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">
                          {favorite.anime_title}
                        </h3>
                        {favorite.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ★ {favorite.rating}/10
                          </Badge>
                        )}
                        <div className="mt-2">
                          <FavoriteButton 
                            anime={{ mal_id: favorite.anime_id, title: favorite.anime_title }}
                            className="w-full h-8 text-xs"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {getFavoritesByListType(listType as ListType).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No anime in this list yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                      Browse Anime
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
