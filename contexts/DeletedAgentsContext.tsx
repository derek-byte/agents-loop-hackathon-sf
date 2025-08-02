"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface DeletedAgentsContextType {
  deletedAgentIds: Set<string>;
  markAsDeleted: (agentId: string) => void;
  isDeleted: (agentId: string) => boolean;
}

const DeletedAgentsContext = createContext<DeletedAgentsContextType | undefined>(undefined);

export function DeletedAgentsProvider({ children }: { children: ReactNode }) {
  const [deletedAgentIds, setDeletedAgentIds] = useState<Set<string>>(new Set());

  const markAsDeleted = (agentId: string) => {
    setDeletedAgentIds(prev => new Set(prev).add(agentId));
  };

  const isDeleted = (agentId: string) => {
    return deletedAgentIds.has(agentId);
  };

  return (
    <DeletedAgentsContext.Provider value={{ deletedAgentIds, markAsDeleted, isDeleted }}>
      {children}
    </DeletedAgentsContext.Provider>
  );
}

export function useDeletedAgents() {
  const context = useContext(DeletedAgentsContext);
  if (!context) {
    throw new Error('useDeletedAgents must be used within DeletedAgentsProvider');
  }
  return context;
}