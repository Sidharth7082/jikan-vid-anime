
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import GifsPage from "./pages/GifsPage";
import DanbooruPage from "./pages/DanbooruPage";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import DMCAPage from "./pages/DMCAPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopAiringPage from "./pages/TopAiringPage";
import MostPopularPage from "./pages/MostPopularPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/gifs" element={<GifsPage />} />
            <Route path="/danbooru" element={<DanbooruPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/dmca" element={<DMCAPage />} />
            <Route path="/top-airing" element={<TopAiringPage />} />
            <Route path="/most-popular" element={<MostPopularPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
