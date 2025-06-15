
import WaifuPicsGallery from "@/components/WaifuPicsGallery";
import { Smile } from "lucide-react";

const ImageGallerySection = () => {
    return (
        <div id="image" className="max-w-7xl mx-auto w-full px-3 sm:px-8 pb-10 pt-8">
            <div className="flex items-center justify-between mt-12 mb-6">
              <div className="flex items-center gap-3">
                <Smile className="text-purple-600 w-7 h-7" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight drop-shadow">Image Gallery</h2>
              </div>
              <a href="https://waifu.pics/docs" target="_blank" rel="noopener noreferrer" className="text-purple-700 font-medium underline underline-offset-2 transition hover:text-purple-500">
                Powered by waifu.pics →
              </a>
            </div>
            <WaifuPicsGallery />
        </div>
    );
};

export default ImageGallerySection;
