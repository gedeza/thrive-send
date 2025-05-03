"use client";

import * as React from "react";
import { useState } from "react";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface HeaderProps {
  logo?: React.ReactNode;
  user?: {
    name: string;
    email?: string;
    image?: string;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };
  

  return (
    <header 
      className={cn("border-b border-border bg-card px-4 py-3 sticky top-0 z-10", className)}
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
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
