"use client";

import * as React from "react";
import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface HeaderProps {
  logo?: React.ReactNode;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  onSearch?: (query: string) => void;
  className?: string;
}

export function Header({ 
  logo, 
  user, 
  onSearch,
  className 
}: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <header 
      className={cn("border-b border-border bg-card px-4 py-3 sticky top-0 z-10 flex items-center justify-between", className)}
      data-testid="header"
      role="banner"
    >
      <div data-testid="header-logo" className="flex items-center">
        {logo || <h1 className="text-xl font-semibold">ThriveSend</h1>}
      </div>
      
      <div className="flex items-center space-x-4">
        {onSearch && (
          <div className="flex-1 max-w-sm">
            <Input 
              type="text" 
              data-testid="header-search-input"
              placeholder="Search..." 
              value={query}
              onChange={handleSearch}
            />
          </div>
        )}
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full overflow-hidden" aria-label="User menu">
                {user.avatar ? (
                  <img 
                    data-testid="header-avatar"
                    src={user.avatar} 
                    alt={`${user.name}'s avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span data-testid="header-user-name">{user.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
