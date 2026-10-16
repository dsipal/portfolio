"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileTextIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchItem } from "@/lib/types";

/**
 * Every search word must appear in the item (cmdk's default fuzzy match lets
 * scattered letters in long descriptions outrank real title matches). Title
 * matches rank above description-only matches.
 */
function wordFilter(value: string, search: string, keywords?: string[]) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${value} ${keywords?.join(" ") ?? ""}`.toLowerCase();
  if (!words.every((w) => haystack.includes(w))) return 0;
  return words.every((w) => value.toLowerCase().includes(w)) ? 1 : 0.5;
}

export function SearchDialog({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 w-9 px-0 text-muted-foreground sm:w-auto sm:justify-between sm:gap-6 sm:px-3"
        aria-label="Search posts"
      >
        <span className="flex items-center gap-2">
          <SearchIcon />
          <span className="hidden sm:inline">Search</span>
        </span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        filter={wordFilter}
        title="Search posts"
        description="Search posts by title or topic"
      >
        <CommandInput placeholder="Search posts…" />
        <CommandList>
          <CommandEmpty>No posts found.</CommandEmpty>
          <CommandGroup heading="Posts">
            {items.map((item) => (
              <CommandItem
                key={item.slug}
                value={`${item.title} ${item.slug}`}
                keywords={[item.category ?? "", item.description ?? ""]}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/post/${item.slug}/`);
                }}
              >
                <FileTextIcon />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{item.title}</span>
                  {item.category && (
                    <span className="truncate text-xs text-muted-foreground">{item.category}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
