"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search jobs, skills, companies...",
}: SearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2"
    >
      <Search className="ml-2 text-zinc-500" size={20} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
      />
      <button className="rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400">
        Search
      </button>
    </form>
  );
}
