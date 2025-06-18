
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DanbooruGallery from "@/components/DanbooruGallery";

const DanbooruPage = () => {
  const handleSearch = async (): Promise<void> => {};

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90">
        <NavBar onSearch={handleSearch} />

        {/* Main Content */}
        <main className="flex-1 w-full py-10">
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-8">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight drop-shadow">Danbooru Gallery</h2>
              <p className="text-lg text-zinc-600 mt-1">High-quality anime artwork and illustrations</p>
            </div>
            <DanbooruGallery />
          </div>
        </main>

        <Footer />
      </div>
      {/* Mobile Sidebar Trigger */}
      <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-white/80 rounded-full p-2 shadow-lg ring-1 ring-zinc-900 hover:bg-purple-200/90 hover:text-purple-800 transition" />
    </SidebarProvider>
  );
};

export default DanbooruPage;
