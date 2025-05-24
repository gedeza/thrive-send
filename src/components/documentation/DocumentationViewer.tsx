'use client';

import { useState } from 'react';
import { MarkdownContent } from './MarkdownContent';
import type { DocPage } from '@/lib/docs/utils';

interface DocumentationViewerProps {
  page: DocPage;
}

export function DocumentationViewer({ page }: DocumentationViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading documentation: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      {page.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-8">{page.description}</p>
      )}
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownContent content={page.content} />
      </div>
    </div>
  );
}