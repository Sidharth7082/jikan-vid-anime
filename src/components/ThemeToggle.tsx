
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor } from "lucide-react";
import { useUserPreferences, Theme } from "@/hooks/useUserPreferences";

export const ThemeToggle = () => {
  const { preferences, updateTheme } = useUserPreferences();

  const currentTheme = preferences?.theme || 'light';

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
  };

  const CurrentIcon = themeIcons[currentTheme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700/50">
          <CurrentIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => updateTheme('light')}>
          <Sun className="w-4 h-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme('dark')}>
          <Moon className="w-4 h-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateTheme('auto')}>
          <Monitor className="w-4 h-4 mr-2" />
          Auto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
