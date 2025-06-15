
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import OtakuGifsGallery from "@/components/OtakuGifsGallery";
import { Gift } from "lucide-react";

const GifsPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#e0e0ff]/60 via-[#f8f4fa]/60 to-[#faf6fb]/90">
        <NavBar onSearch={() => {}} />

        {/* Main Content */}
        <main className="flex-1 w-full py-10">
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Gift className="text-purple-600 w-7 h-7" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight drop-shadow">GIF Gallery</h2>
              </div>
              <a href="https://otakugifs.xyz/" target="_blank" rel="noopener noreferrer" className="text-purple-700 font-medium underline underline-offset-2 transition hover:text-purple-500">
                Powered by otakugifs.xyz →
              </a>
            </div>
            <OtakuGifsGallery />
          </div>
        </main>

        <Footer />
      </div>
      {/* Mobile Sidebar Trigger */}
      <SidebarTrigger className="fixed top-4 left-4 z-[100] md:hidden bg-white/80 rounded-full p-2 shadow-lg ring-1 ring-zinc-900 hover:bg-purple-200/90 hover:text-purple-800 transition" />
    </SidebarProvider>
  );
};

export default GifsPage;
