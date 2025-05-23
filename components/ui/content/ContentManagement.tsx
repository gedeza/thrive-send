import React from 'react';
import { Card } from '../patterns/card';
import { PrimaryButton } from '../PrimaryButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface Content {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
  };
}

interface ContentManagementProps {
  contents: Content[];
  onContentCreate: () => void;
  onContentEdit: (id: string) => void;
  onContentDelete: (id: string) => void;
}

export function ContentManagement({
  contents,
  onContentCreate,
  onContentEdit,
  onContentDelete,
}: ContentManagementProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <PrimaryButton onClick={onContentCreate}>
          Create New Content
        </PrimaryButton>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ContentList
            contents={contents}
            onEdit={onContentEdit}
            onDelete={onContentDelete}
          />
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <ContentList
            contents={contents.filter(content => content.status === 'DRAFT')}
            onEdit={onContentEdit}
            onDelete={onContentDelete}
          />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <ContentList
            contents={contents.filter(content => content.status === 'PUBLISHED')}
            onEdit={onContentEdit}
            onDelete={onContentDelete}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <ContentList
            contents={contents.filter(content => content.status === 'SCHEDULED')}
            onEdit={onContentEdit}
            onDelete={onContentDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentList({
  contents,
  onEdit,
  onDelete,
}: {
  contents: Content[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <Card key={content.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{content.title}</h3>
              <p className="text-sm text-gray-500">
                By {content.author.name} • {new Date(content.createdAt).toLocaleDateString()}
              </p>
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                {content.status}
              </span>
            </div>
            <div className="space-x-2">
              <PrimaryButton
                variant="outline"
                onClick={() => onEdit(content.id)}
              >
                Edit
              </PrimaryButton>
              <PrimaryButton
                variant="destructive"
                onClick={() => onDelete(content.id)}
              >
                Delete
              </PrimaryButton>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 