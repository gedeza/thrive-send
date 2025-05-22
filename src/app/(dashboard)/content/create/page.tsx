import React from 'react';
import { ContentForm } from '@/components/content/ContentForm';

export default function CreateContentPage() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Content</h1>
      <ContentForm />
    </div>
  );
} 