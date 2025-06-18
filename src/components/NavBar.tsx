
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ChevronDown, Settings, LogIn } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface NavBarProps {
  onSearch: (res: any | null) => Promise<void>;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setSelectedIndex(-1);
      await onSearch(null);
      return;
    }

    try {
      const results = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
      const data = await results.json();
      setSearchResults(data.data || []);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  };

  const handleResultClick = async (anime: any) => {
    setSearchQuery("");
    setSearchResults([]);
    setMobileSearchOpen(false);
    await onSearch(anime);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add safety checks for searchResults
    if (!searchResults || !Array.isArray(searchResults)) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex < searchResults.length - 1 ? prevIndex + 1 : searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex !== -1 && searchResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(searchResults[selectedIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1824]/95 backdrop-blur-sm border-b border-[#1f2937]">
      <div className="max-w-7xl mx-auto px-3 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ffb800] to-[#ff9500] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">A</span>
            </div>
            <span className="text-white font-bold text-xl">AnimeStream</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#9ca3af] hover:text-[#ffb800] transition-colors font-medium">
              Home
            </Link>
            <Link to="/top-airing" className="text-[#9ca3af] hover:text-[#ffb800] transition-colors font-medium">
              Top Anime
            </Link>
            <Link to="/most-popular" className="text-[#9ca3af] hover:text-[#ffb800] transition-colors font-medium">
              Popular
            </Link>
            <Link to="/browse" className="text-[#9ca3af] hover:text-[#ffb800] transition-colors font-medium">
              Browse
            </Link>
            <Link to="/gifs" className="text-[#9ca3af] hover:text-[#ffb800] transition-colors font-medium">
              GIFs
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search anime..."
                className="w-full px-4 py-2 pl-10 bg-[#1f2937] border border-[#374151] rounded-lg text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
              
              {/* Search Results Dropdown - Add safety check */}
              {searchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f2937] border border-[#374151] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((anime, index) => (
                    <div
                      key={anime.mal_id}
                      className={`flex items-center p-3 hover:bg-[#374151] cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-[#374151]' : ''
                      }`}
                      onClick={() => handleResultClick(anime)}
                    >
                      <img
                        src={anime.images?.jpg?.small_image_url || "/placeholder.svg"}
                        alt={anime.title}
                        className="w-12 h-16 object-cover rounded mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{anime.title}</h3>
                        <p className="text-[#9ca3af] text-sm truncate">
                          {anime.year} • {anime.type} • ⭐ {anime.score || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden text-[#9ca3af] hover:text-[#ffb800] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-[#9ca3af] hover:text-[#ffb800] transition-colors">
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1f2937] border-[#374151]">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="text-white hover:text-[#ffb800]">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="text-white hover:text-[#ffb800]">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#374151]" />
                <DropdownMenuItem asChild>
                  <Link to="/auth" className="text-white hover:text-[#ffb800]">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-full px-4 py-2 pl-10 bg-[#1f2937] border border-[#374151] rounded-lg text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
