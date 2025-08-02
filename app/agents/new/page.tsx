"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

export default function NewAgentPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "",
    personality: "professional",
    responseStyle: "balanced",
    knowledge: "",
  });

  const templates = [
    {
      id: "benefits",
      name: "Benefits Assistant",
      description: "Pre-configured for handling employee benefits inquiries",
      icon: "🏥",
    },
    {
      id: "onboarding",
      name: "Onboarding Guide",
      description: "Optimized for new employee orientation",
      icon: "👋",
    },
    {
      id: "policy",
      name: "Policy Expert",
      description: "Trained on company policies and procedures",
      icon: "📋",
    },
    {
      id: "custom",
      name: "Custom Agent",
      description: "Start from scratch with full customization",
      icon: "🛠️",
    },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to agents
          </Link>
          
          <h1 className="text-3xl font-semibold text-white">Create a new agent</h1>
          <p className="mt-2 text-sm text-gray-400">
            Set up an AI-powered HR assistant for your team
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i < step
                      ? "bg-white text-black"
                      : i === step
                      ? "bg-gray-800 text-white ring-2 ring-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {i < step ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i
                  )}
                </div>
                {i < 3 && (
                  <div className={`h-px w-16 ${i < step ? "bg-white" : "bg-gray-800"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Choose template</span>
            <span className="ml-12">Configure agent</span>
            <span>Add knowledge</span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-medium text-white mb-6">Choose a template</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    className={`rounded-lg border p-6 text-left transition-all ${
                      formData.template === template.id
                        ? "border-white bg-gray-900"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="mb-3 text-2xl">{template.icon}</div>
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-medium text-white mb-6">Configure your agent</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-gray-800 bg-black px-4 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                    placeholder="e.g., Benefits Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-800 bg-black px-4 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
                    placeholder="Describe what this agent will help with..."
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Personality
                    </label>
                    <select
                      value={formData.personality}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      className="w-full rounded-md border border-gray-800 bg-black px-4 py-2 text-white focus:border-white focus:outline-none"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="empathetic">Empathetic</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Response style
                    </label>
                    <select
                      value={formData.responseStyle}
                      onChange={(e) => setFormData({ ...formData, responseStyle: e.target.value })}
                      className="w-full rounded-md border border-gray-800 bg-black px-4 py-2 text-white focus:border-white focus:outline-none"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-medium text-white mb-6">Add knowledge base</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company context
                </label>
                <textarea
                  value={formData.knowledge}
                  onChange={(e) => setFormData({ ...formData, knowledge: e.target.value })}
                  rows={8}
                  className="w-full rounded-md border border-gray-800 bg-black px-4 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none"
                  placeholder="Paste your company policies, procedures, and documentation here..."
                />
              </div>

              <div className="rounded-lg border-2 border-dashed border-gray-800 p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-4 text-sm text-gray-400">
                  Drop files here or click to upload
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, TXT, DOC, DOCX up to 10MB
                </p>
                <button type="button" className="mt-4 rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">
                  Choose files
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              step === 1
                ? "text-gray-500 cursor-not-allowed"
                : "text-white hover:bg-gray-900"
            }`}
          >
            Back
          </button>
          
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              Cancel
            </Link>
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.template}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90">
                Create agent
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}