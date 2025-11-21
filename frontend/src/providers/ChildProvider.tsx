/**
 * Child Context Provider
 * Consolidated single source of truth for children state management
 * Manages selected child and children list with auto-fetching
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getChildren, type Child } from '../api/services/childService';
import { STORAGE_KEYS } from '../api/client/apiConfig';

interface ChildContextValue {
  selectedChildId: string | null;
  children: Child[];
  loading: boolean;
  error: string | null;
  setSelectedChildId: (id: string) => void;
  refreshChildren: () => Promise<void>;
}

const ChildContext = createContext<ChildContextValue | undefined>(undefined);

interface ChildProviderProps {
  children: ReactNode;
}

export const ChildProvider = ({ children }: ChildProviderProps) => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        // Not authenticated - skip fetching
        setChildrenList([]);
        setLoading(false);
        return;
      }

      const fetchedChildren = await getChildren();
      setChildrenList(fetchedChildren);

      // Auto-select first child if none selected
      if (fetchedChildren.length > 0 && !selectedChildId) {
        setSelectedChildId(fetchedChildren[0].id);
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      // Don't set error for 401 - user might just not be logged in
      const is401 = err instanceof Error && err.message.includes('401');
      if (!is401) {
        setError('Failed to load children');
      }
      setChildrenList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshChildren = async () => {
    await fetchChildren();
  };

  const value: ChildContextValue = {
    selectedChildId,
    children: childrenList,
    loading,
    error,
    setSelectedChildId,
    refreshChildren
  };

  return (
    <ChildContext.Provider value={value}>
      {children}
    </ChildContext.Provider>
  );
};

// Custom hook for accessing child context
export const useChild = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChild must be used within ChildProvider');
  }
  return context;
};

// Export alias for compatibility (some components may use this name)
export const useChildContext = useChild;
