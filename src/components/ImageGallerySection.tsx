
import OtakuGifsGallery from "@/components/OtakuGifsGallery";
import { Gift } from "lucide-react";

const ImageGallerySection = () => {
    return (
        <div id="image" className="max-w-7xl mx-auto w-full px-3 sm:px-8">
            <div className="flex items-center justify-between mt-12 mb-6">
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
    );
};

export default ImageGallerySection;
