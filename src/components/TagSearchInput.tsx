import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2 } from 'lucide-react';

interface Tag {
  name: string;
  post_count: number;
}

interface TagSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const TagSearchInput: React.FC<TagSearchInputProps> = ({ value, onChange, id }) => {
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCurrentTag = useCallback(() => {
    return value.split(' ').pop() || '';
  }, [value]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const currentTag = getCurrentTag();

    if (currentTag.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://danbooru.donmai.us/tags.json', {
          params: {
            'search[name_matches]': `${currentTag}*`,
            'search[order]': 'count',
            limit: 10,
          },
        });
        const filteredSuggestions = response.data.filter((tag: any) => tag.name && tag.post_count > 0);
        setSuggestions(filteredSuggestions);
        setOpen(filteredSuggestions.length > 0);
      } catch (error) {
        console.error("Failed to fetch tag suggestions", error);
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value, getCurrentTag]);

  const handleSelect = (selectedTag: string) => {
    const parts = value.split(' ');
    parts[parts.length - 1] = selectedTag;
    const newValue = parts.join(' ') + ' ';
    onChange(newValue);
    setOpen(false);
    setTimeout(() => {
        inputRef.current?.focus();
    }, 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
          setTimeout(() => setOpen(false), 50);
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (suggestions.length > 0) {
            e.preventDefault(); // prevent cursor move
        }
      }
  }

  return (
    <div ref={containerRef} className="relative">
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <CommandInput
          ref={inputRef}
          id={id}
          placeholder="e.g. 'genshin_impact long_hair'"
          value={value}
          onValueChange={onChange}
          onFocus={() => {
              if (suggestions.length > 0 && getCurrentTag().length > 1) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="text-base md:text-sm"
        />
        {open && (
            <CommandList className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg">
              {loading ? (
                <CommandItem disabled className="p-2 flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </CommandItem>
              ) : (
                <>
                  <CommandEmpty>No results found for "{getCurrentTag()}"</CommandEmpty>
                  <CommandGroup>
                    {suggestions.map(tag => (
                      <CommandItem
                        key={tag.name}
                        value={tag.name}
                        onSelect={() => handleSelect(tag.name)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <span className="truncate">{tag.name.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap ml-4">
                          {tag.post_count > 1000 ? `${(tag.post_count / 1000).toFixed(1)}k` : tag.post_count.toLocaleString()}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
        )}
      </Command>
    </div>
  );
};

export default TagSearchInput;
