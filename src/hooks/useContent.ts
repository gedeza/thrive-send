import { useState, useCallback } from 'react';
import { CreateContentInput, UpdateContentInput } from '@/services/content.service';

interface UseContentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useContent(options: UseContentOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createContent = useCallback(async (data: CreateContentInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const result = await response.json();
      options.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const updateContent = useCallback(async (data: UpdateContentInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/content/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      const result = await response.json();
      options.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const deleteContent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const getContent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/content/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const listContent = useCallback(async (params: {
    status?: string;
    authorId?: string;
    projectId?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/content?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch content list');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const getContentStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/content/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch content stats');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    getContent,
    listContent,
    getContentStats,
  };
} 