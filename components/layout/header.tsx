import React from 'react';
import { DropdownMenu } from '../ui/dropdown-menu';
import Link from 'next/link';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Thrive Send
          </Link>
          
          <nav className="ml-10 hidden md:flex">
            <Link href="/dashboard" className="mx-2 px-3 py-2 text-sm">
              Dashboard
            </Link>
            <Link href="/content" className="mx-2 px-3 py-2 text-sm">
              Content
            </Link>
            <Link href="/analytics" className="mx-2 px-3 py-2 text-sm">
              Analytics
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <div className="flex items-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full"
                      data-testid="user-avatar"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="ml-2 hidden md:inline">{user.name}</span>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label>{user.name}</DropdownMenu.Label>
                <DropdownMenu.Label>{user.email}</DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                <DropdownMenu.Item>Settings</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Logout</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <div className="flex items-center">
              <Link href="/login" className="mr-4 text-sm">
                Login
              </Link>
              <Link href="/signup" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};