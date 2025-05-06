"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  // Sample templates - replace with your real data
  const templates = [
    { id: '1', name: 'Welcome Email', category: 'Email', lastUpdated: '2023-10-15' },
    { id: '2', name: 'Weekly Newsletter', category: 'Email', lastUpdated: '2023-11-02' },
    { id: '3', name: 'Product Announcement', category: 'Social Media', lastUpdated: '2023-11-10' },
    { id: '4', name: 'Customer Survey', category: 'Form', lastUpdated: '2023-10-28' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable content templates
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{template.name}</CardTitle>
              <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                {template.category}
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                Template Preview
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Last updated: {template.lastUpdated}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-3 bg-gray-50">
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link href={`/templates/editor/${template.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
