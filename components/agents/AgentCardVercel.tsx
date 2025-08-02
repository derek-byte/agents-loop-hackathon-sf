"use client";

import { useState, useRef, useEffect } from "react";

interface AgentCardProps {
  name: string;
  description: string;
  status: "active" | "inactive" | "training";
  lastActive?: string;
  domain?: string;
  onDelete?: () => void;
}

export default function AgentCardVercel({
  name,
  description,
  status,
  lastActive = "2 hours ago",
  domain = "hr-agent.company.com",
  onDelete
}: AgentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusColors = {
    active: "bg-green-400",
    inactive: "bg-gray-400",
    training: "bg-yellow-400",
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="group relative rounded-lg border border-gray-800 bg-gray-950 p-6 transition-all hover:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-white">{name}</h3>
            <span className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          </div>
          <p className="text-sm text-gray-400 mb-3">{description}</p>
          <p className="text-xs text-gray-500">{domain}</p>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-900 border border-gray-800 shadow-lg z-10">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Duplicate
                </button>
                <hr className="my-1 border-gray-800" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>Updated {lastActive}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          234 conversations
        </span>
      </div>
    </div>
  );
}