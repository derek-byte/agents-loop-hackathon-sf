"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AgentCardVercel from "@/components/agents/AgentCardVercel";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [agents, setAgents] = useState([
    {
      name: "Benefits Assistant",
      description: "Handles employee benefits inquiries and enrollment",
      status: "active" as const,
      lastActive: "2 minutes ago",
    },
    {
      name: "Onboarding Guide",
      description: "Assists new employees with onboarding process",
      status: "active" as const,
      lastActive: "1 hour ago",
    },
    {
      name: "Policy Expert",
      description: "Answers questions about company policies",
      status: "training" as const,
      lastActive: "3 hours ago",
    },
    {
      name: "Leave Manager",
      description: "Manages PTO requests and leave balances",
      status: "active" as const,
      lastActive: "30 minutes ago",
    },
    {
      name: "Performance Coach",
      description: "Provides guidance on performance reviews",
      status: "inactive" as const,
      lastActive: "2 days ago",
    },
    {
      name: "Payroll Assistant",
      description: "Helps with payroll inquiries and issues",
      status: "active" as const,
      lastActive: "5 minutes ago",
    },
  ]);

  const handleDeleteAgent = (agentName: string) => {
    if (confirm(`Are you sure you want to delete "${agentName}"?`)) {
      setAgents(agents.filter(agent => agent.name !== agentName));
    }
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
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent, index) => (
            <AgentCardVercel 
              key={index} 
              {...agent} 
              onDelete={() => handleDeleteAgent(agent.name)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No agents found matching your criteria.</p>
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