/**
 * Custom hook for Children Management
 * Provides data fetching and mutations for children
 */

import { useState, useCallback, useEffect } from 'react';
import type { Child } from '../api/services/childService';
import { getChildren } from '../api/services/childService';

export const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChildren();
      setChildren(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch children');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    children,
    loading,
    error,
    fetchChildren,
  };
};
