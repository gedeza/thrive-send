"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { templates, type Template } from "@/app/(dashboard)/templates/templates.mock-data";
import { Input } from "@/components/ui/input";

const statusBadgeMap: Record<Template["status"], string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-900",
  archived: "bg-gray-100 text-gray-600"
};

const typeBadgeMap: Record<Template["type"], string> = {
  email: "bg-blue-100 text-blue-800",
  social: "bg-indigo-100 text-indigo-800",
  blog: "bg-orange-100 text-orange-800"
};

export default function TemplatesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    return templates.filter((template: Template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.createdBy.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable content templates
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, type, author..."
            className="max-w-xs"
            aria-label="Search templates"
          />
          <Button asChild>
            <Link href="/templates/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map((template: Template) => (
          <Card key={template.id} className="overflow-hidden group shadow-sm border">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <div>
                <CardTitle>{template.name}</CardTitle>
                <span className={`text-xs rounded-full px-2 py-1 capitalize ml-2 ${typeBadgeMap[template.type]}`}>
                  {template.type}
                </span>
                <span className={`ml-2 text-xs rounded-full px-2 py-1 capitalize ${statusBadgeMap[template.status]}`}>
                  {template.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground ml-2">by {template.createdBy}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center text-gray-400 text-sm">
                Template Preview
              </div>
              <p className="text-xs text-muted-foreground mt-3 mb-2">
                Last updated: {new Date(template.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <p className="text-xs mb-2">{template.description}</p>
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
        )) : (
          <div className="text-center py-8 col-span-full text-muted-foreground border rounded-lg">No templates found</div>
        )}
      </div>
    </div>
  );
}
