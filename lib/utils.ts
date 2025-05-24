import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocPage } from './types';

const docsDirectory = path.join(process.cwd(), 'DOCS/user-guides');

export async function getDocPage(slug: string): Promise<DocPage> {
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    title: data.title,
    description: data.description,
    content,
    slug,
  };
}
/**
 * Combines multiple class names or class name objects into a single string.
 * Uses clsx for conditional class names and tailwind-merge to handle Tailwind CSS class conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}