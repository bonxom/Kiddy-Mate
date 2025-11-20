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
      
      const children = await getChildren();
      setChildrenList(children);
      
      // Auto-select first child if none selected
      if (children.length > 0 && !selectedChildId) {
        setSelectedChildId(children[0].id);
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

  useEffect(() => {
    fetchChildren();
  }, []);

  const refreshChildren = async () => {
    await fetchChildren();
  };

  return (
    <ChildContext.Provider 
      value={{ 
        selectedChildId, 
        children: childrenList, 
        loading,
        error,
        setSelectedChildId,
        refreshChildren
      }}
    >
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChild must be used within ChildProvider');
  }
  return context;
};
