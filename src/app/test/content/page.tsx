"use client";

import { ContentTestRunner } from '@/components/test/ContentTestRunner';

export default function ContentTestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Content System Tests</h1>
      <ContentTestRunner />
    </div>
  );
} 