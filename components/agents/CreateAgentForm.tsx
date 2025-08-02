"use client";

import { useState } from "react";

export default function CreateAgentForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "professional",
    responseStyle: "concise",
    knowledgeBase: "",
    welcomeMessage: "",
    companyContext: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Benefits Assistant"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe what this agent will help with..."
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personality & Behavior</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="personality" className="block text-sm font-medium text-gray-300 mb-2">
              Personality Type
            </label>
            <select
              id="personality"
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly & Casual</option>
              <option value="empathetic">Empathetic</option>
              <option value="direct">Direct & Concise</option>
            </select>
          </div>

          <div>
            <label htmlFor="responseStyle" className="block text-sm font-medium text-gray-300 mb-2">
              Response Style
            </label>
            <select
              id="responseStyle"
              name="responseStyle"
              value={formData.responseStyle}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="conversational">Conversational</option>
              <option value="step-by-step">Step-by-step</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-300 mb-2">
            Welcome Message
          </label>
          <textarea
            id="welcomeMessage"
            name="welcomeMessage"
            value={formData.welcomeMessage}
            onChange={handleChange}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Hello! I'm here to help you with..."
          />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Knowledge Base</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="companyContext" className="block text-sm font-medium text-gray-300 mb-2">
              Company Context & Policies
            </label>
            <textarea
              id="companyContext"
              name="companyContext"
              value={formData.companyContext}
              onChange={handleChange}
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your company policies, procedures, and context here..."
            />
          </div>

          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-400 mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500">Support for PDF, TXT, DOC, DOCX files</p>
            <button type="button" className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Choose Files
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integration Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-700 rounded focus:ring-primary-500" />
            <span className="text-gray-300">Connect to n8n workflow</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-700 rounded focus:ring-primary-500" />
            <span className="text-gray-300">Enable API access</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-700 rounded focus:ring-primary-500" />
            <span className="text-gray-300">Log conversations for training</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Agent
        </button>
        <button
          type="button"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}