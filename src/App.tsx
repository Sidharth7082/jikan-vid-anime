
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import Browse from "./pages/Browse";
import ProfilePage from "./pages/ProfilePage";
import GifsPage from "./pages/GifsPage";
import DanbooruPage from "./pages/DanbooruPage";
import SettingsPage from "./pages/SettingsPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import DMCAPage from "./pages/DMCAPage";
import ContactPage from "./pages/ContactPage";
import UserDashboard from "./pages/UserDashboard";
import AdvancedSearchPage from "./pages/AdvancedSearchPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/browse/:letter" element={<Browse />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/gifs" element={<GifsPage />} />
          <Route path="/danbooru" element={<DanbooruPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
