"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "professional",
    response_style: "balanced",
    knowledge_base: "",
    company_context: "",
    welcome_message: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Agent name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to enhance agent data with Claude
  const enhanceAgentWithClaude = async (agentData: any) => {
    try {
      const response = await fetch('/api/agents/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentData }),
      });
      
      if (response.ok) {
        const enhanced = await response.json();
        console.log('Agent enhanced successfully');
        return enhanced;
      } else {
        console.warn('Enhancement failed, using original data');
      }
    } catch (error) {
      console.error('Failed to enhance with Claude:', error);
    }
    return agentData; // Return original if enhancement fails
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Prepare agent data
      let agentData = {
        ...formData,
        status: 'active',
        welcome_message: formData.welcome_message || `Hello! I'm ${formData.name}. How can I help you today?`,
      };
      
      // Step 2: Enhance with Claude
      console.log('Enhancing agent with Claude...');
      agentData = await enhanceAgentWithClaude(agentData);
      
      // Step 3: Create agent
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const agent = await response.json();
      router.push('/');
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-gray-800">
        <div className="px-8 py-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </nav>
      
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">Create a new agent</h1>
          <p className="mt-3 text-lg text-gray-400">
            Configure an AI-powered HR assistant for your team
          </p>
        </div>

        <form onSubmit={handleCreateAgent} className="space-y-12">
          {/* Basic Information */}
          <div className="border-b border-gray-800 pb-12">
            <h2 className="text-2xl font-semibold text-white mb-8">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-800'} bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white`}
                  placeholder="e.g., HR Benefits Assistant"
                />
                {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  rows={3}
                  className={`w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-800'} bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white`}
                  placeholder="Describe what this agent will help with..."
                />
                {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="welcome" className="block text-sm font-medium text-white mb-2">
                  Welcome Message
                </label>
                <input
                  id="welcome"
                  type="text"
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Hello! I'm here to help with your HR questions."
                />
                <p className="mt-2 text-sm text-gray-400">The first message users will hear when they start a conversation</p>
              </div>
            </div>
          </div>

          {/* Behavior Configuration */}
          <div className="border-b border-gray-800 pb-12">
            <h2 className="text-2xl font-semibold text-white mb-8">Behavior Configuration</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="personality" className="block text-sm font-medium text-white mb-2">
                  Personality
                </label>
                <select
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="empathetic">Empathetic</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              <div>
                <label htmlFor="response_style" className="block text-sm font-medium text-white mb-2">
                  Response Style
                </label>
                <select
                  id="response_style"
                  value={formData.response_style}
                  onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="balanced">Balanced</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="pb-12">
            <h2 className="text-2xl font-semibold text-white mb-8">Knowledge Base</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="company_context" className="block text-sm font-medium text-white mb-2">
                  Company Context
                </label>
                <textarea
                  id="company_context"
                  value={formData.company_context}
                  onChange={(e) => setFormData({ ...formData, company_context: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white font-mono text-sm"
                  placeholder="Company name, industry, size, culture, values..."
                />
              </div>

              <div>
                <label htmlFor="knowledge_base" className="block text-sm font-medium text-white mb-2">
                  Policies & Documentation
                </label>
                <textarea
                  id="knowledge_base"
                  value={formData.knowledge_base}
                  onChange={(e) => setFormData({ ...formData, knowledge_base: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white font-mono text-sm"
                  placeholder="Paste your company policies, procedures, FAQs, and documentation here..."
                />
                <p className="mt-2 text-sm text-gray-400">This information will be used to provide accurate, company-specific responses</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-8">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating agent...
                </span>
              ) : (
                'Create agent'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}