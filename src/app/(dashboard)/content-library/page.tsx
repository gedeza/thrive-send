"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample content library data - replace with real data fetching
  const contentLibrary = {
    templates: [
      { id: '1', name: 'Welcome Email', category: 'Email', lastUsed: 'June 15, 2023' },
      { id: '2', name: 'Product Announcement', category: 'Email', lastUsed: 'May 20, 2023' },
      { id: '3', name: 'Newsletter Template', category: 'Email', lastUsed: 'April 10, 2023' },
    ],
    media: [
      { id: '1', name: 'Company Logo', type: 'Image', size: '245KB', uploaded: 'June 2, 2023' },
      { id: '2', name: 'Product Demo Video', type: 'Video', size: '12.5MB', uploaded: 'May 18, 2023' },
      { id: '3', name: 'Team Photo', type: 'Image', size: '1.2MB', uploaded: 'April 25, 2023' },
    ],
    snippets: [
      { id: '1', name: 'Product Benefits', category: 'Copy', created: 'June 10, 2023' },
      { id: '2', name: 'Call to Action', category: 'Copy', created: 'May 15, 2023' },
      { id: '3', name: 'Testimonial Block', category: 'Copy', created: 'April 20, 2023' },
    ]
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Access and manage your reusable content assets
          </p>
        </div>
        <Button
          asChild
          className="mt-4 sm:mt-0"
          data-testid="add-to-library"
        >
          <Link href="/content/new?library=true">
            Add to Library
          </Link>
        </Button>
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          type="search"
          placeholder="Search content library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full max-w-md mb-6 grid grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contentLibrary.templates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Used:</span>
                      <span className="text-sm">{template.lastUsed}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/content-library/templates/${template.id}`}>
                        Use Template
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="media">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contentLibrary.media.map(item => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm font-medium">{item.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Size:</span>
                      <span className="text-sm">{item.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Uploaded:</span>
                      <span className="text-sm">{item.uploaded}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/content-library/media/${item.id}`}>
                        Preview
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="snippets">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contentLibrary.snippets.map(snippet => (
              <Card key={snippet.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{snippet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium">{snippet.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{snippet.created}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/content-library/snippets/${snippet.id}`}>
                        Use Snippet
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Empty state that shows when a tab has no items */}
        {Object.values(contentLibrary).some(collection => collection.length === 0) && (
          <Card className="text-center p-6 mt-4">
            <CardContent className="pt-6">
              <p className="mb-4">No items found in this category</p>
              <Button asChild>
                <Link href="/content/new?library=true">
                  Add New Item
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}