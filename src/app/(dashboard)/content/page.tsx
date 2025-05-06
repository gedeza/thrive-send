"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContentPage() {
  // Sample content data - replace with real data fetching
  const contentItems = [
    { id: '1', title: 'Product Benefits', type: 'Email Copy', lastModified: 'June 12, 2023' },
    { id: '2', title: 'Customer Testimonials', type: 'Social Media', lastModified: 'June 5, 2023' },
    { id: '3', title: 'Summer Sale Banner', type: 'Image', lastModified: 'May 28, 2023' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted-foreground">
            Manage your marketing content
          </p>
        </div>
        <Link
          href="/content/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          data-testid="create-content"
        >
          <span className="mr-2 text-lg font-bold">+</span>
          Create Content
        </Link>
      </div>
      
      {contentItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contentItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Modified:</span>
                    <span className="text-sm">{item.lastModified}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Link 
                    href={`/content/edit/${item.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/content/view/${item.id}`}
                    className="text-sm text-blue-600 hover:underline"
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
