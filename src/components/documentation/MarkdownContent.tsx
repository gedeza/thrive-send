'use client';

import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import { useEffect, useState } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processContent = async () => {
      try {
        const processed = await serialize(content, {
          mdxOptions: {
            rehypePlugins: [rehypeHighlight],
          },
        });
        setMdxSource(processed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process markdown');
      }
    };

    processContent();
  }, [content]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!mdxSource) {
    return <div>Loading...</div>;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote {...mdxSource} />
    </div>
  );
}
