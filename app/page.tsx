"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AgentCardVercel from "@/components/agents/AgentCardVercel";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "training";
  conversation_count?: number;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(`Are you sure you want to delete "${agentName}"?`)) {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete agent');
        
        setAgents(agents.filter(agent => agent.id !== agentId));
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent. Please try again.');
      }
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Filter agents based on search query and status filter
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || agent.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus, agents]);

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">HR Agents</h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage and monitor your AI-powered HR assistants
            </p>
          </div>
          
          <Link href="/agents/new" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Agent
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-800 bg-gray-950 px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:border-gray-700 focus:outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-white focus:border-gray-700 focus:outline-none appearance-none"
          >
            <option value="all">All Agents</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="training">Training</option>
          </select>
        </div>
        
        {(searchQuery || filterStatus !== "all") && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {filteredAgents.length} of {agents.length} agents
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Loading agents...</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <AgentCardVercel 
              key={agent.id} 
              name={agent.name}
              description={agent.description || ''}
              status={agent.status}
              lastActive={getRelativeTime(agent.updated_at)}
              conversationCount={agent.conversation_count || 0}
              onDelete={() => handleDeleteAgent(agent.id, agent.name)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">
              {agents.length === 0 
                ? "No agents yet. Create your first agent to get started." 
                : "No agents found matching your criteria."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 rounded-lg border border-gray-800 bg-gradient-to-r from-gray-950 to-gray-900 p-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold text-white">Need help setting up?</h2>
          <p className="mt-3 text-sm text-gray-400">
            Our team is here to help you create and customize AI agents that perfectly match your HR needs.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="rounded-md border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900">
              Read Documentation
            </button>
            <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}