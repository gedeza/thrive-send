"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentItems, type ContentItem } from "./content.mock-data";

const statusBadgeMap: Record<ContentItem["status"], string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-900",
  archived: "bg-gray-100 text-gray-600"
};

export default function ContentPage() {
  const [search, setSearch] = useState("");
  
  const filtered = useMemo(() => {
    if (!search.trim()) return contentItems;
    return contentItems.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
      item.author.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted-foreground">
            Manage all your inbound & outbound creative content
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, tag, or author..."
            className="max-w-xs"
            aria-label="Search content"
          />
          <Button
            asChild
            variant="primary"
            data-testid="create-content"
            className="px-4 py-2"
          >
            <Link href="/content/new">
              <span className="mr-2 text-lg font-bold">+</span>
              Create Content
            </Link>
          </Button>
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <Card key={item.id} className="overflow-hidden group shadow-sm border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge className={`capitalize ${statusBadgeMap[item.status]}`}>{item.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modified:</span>
                    <span>{new Date(item.lastModified).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Author:</span>
                    <span>{item.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="text-xs border border-gray-300 capitalize text-muted-foreground bg-white"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2 text-sm">
                  <Link 
                    href={`/content/edit/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/content/view/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg text-muted-foreground">
          <p className="mb-4">No content items found</p>
          <p className="text-sm">Create your first content item to get started</p>
        </div>
      )}
    </div>
  );
}
