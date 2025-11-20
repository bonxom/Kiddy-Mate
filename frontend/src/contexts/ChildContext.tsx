/**
 * Child Context
 * Provides global state for children list and selected child
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useChildren } from '../hooks/useChildren';
import type { Child } from '../api/services/childService';

interface ChildContextType {
  children: Child[];
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  refetchChildren: () => Promise<Child[]>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

interface ChildProviderProps {
  children: ReactNode;
}

export const ChildProvider = ({ children: reactChildren }: ChildProviderProps) => {
  const { children, loading, error, fetchChildren } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const value: ChildContextType = {
    children,
    selectedChildId,
    setSelectedChildId,
    loading,
    error,
    refetchChildren: fetchChildren,
  };

  return (
    <ChildContext.Provider value={value}>
      {reactChildren}
    </ChildContext.Provider>
  );
};

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
};
