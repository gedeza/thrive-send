"use client";

import * as React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

export interface HeaderProps {
  logo?: React.ReactNode;
  onSearch?: (query: string) => void;
  className?: string;
}

export function Header({ 
  logo, 
  onSearch,
  className 
}: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header 
      className={cn("border-b border-border bg-card px-4 py-3", className)}
      data-testid="header"
      role="banner"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div data-testid="header-logo" className="flex items-center">
            {logo || <h1 className="text-xl font-semibold">ThriveSend</h1>}
          </div>
          
          {onSearch && (
            <form onSubmit={handleSearch} className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                data-testid="header-search-input"
                placeholder="Search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8"
              />
            </form>
          )}
        </div>
      </div>
    </header>
  );
} 