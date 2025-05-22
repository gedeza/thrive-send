import { Content, CreateContentInput, UpdateContentInput } from '../types/content';

export async function createContent(input: CreateContentInput): Promise<Content> {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create content');
  }

  return response.json();
}

export async function updateContent(input: UpdateContentInput): Promise<Content> {
  const response = await fetch(`/api/content/${input.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update content');
  }

  return response.json();
}

export async function getContent(id: string): Promise<Content> {
  const response = await fetch(`/api/content/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch content');
  }

  return response.json();
}

export async function deleteContent(id: string): Promise<void> {
  const response = await fetch(`/api/content/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete content');
  }
} 