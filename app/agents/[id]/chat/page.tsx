"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import Vapi from "@vapi-ai/web";
import Skeleton from "@/components/ui/Skeleton";
import { useDeletedAgents } from "@/contexts/DeletedAgentsContext";

interface Agent {
  id: string;
  name: string;
  description: string;
  personality: string;
  response_style: string;
  knowledge_base: string;
  company_context: string;
  welcome_message: string;
  vapi_assistant_id?: string;
}

export default function AgentChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { isDeleted } = useDeletedAgents();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Check if agent is deleted before fetching
    if (isDeleted(id)) {
      console.log('Agent has been deleted, redirecting to home');
      router.push('/');
      return;
    }
    
    fetchAgent();
    initializeVapi();
  }, [id, isDeleted, router]);

  const fetchAgent = async () => {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agent:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error, null, 2)
        });
        if (error.code === 'PGRST116') {
          // Agent not found
          console.log('Agent not found, redirecting to home');
        }
        throw error;
      }
      
      console.log('Fetched agent:', data);
      setAgent(data);
    } catch (error: any) {
      console.error('Error in fetchAgent catch block:', {
        message: error?.message || 'Unknown error',
        code: error?.code,
        stack: error?.stack,
        fullError: error
      });
      // Add a small delay before redirecting to ensure error is logged
      setTimeout(() => {
        router.push('/');
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeVapi = () => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (!publicKey) {
        console.error('VAPI public key not found in environment variables');
        return;
      }
      
      console.log('Initializing VAPI with public key:', publicKey);
      const vapiInstance = new Vapi(publicKey);
      
      // Set up event listeners
      vapiInstance.on('call-start', () => {
        console.log('Call started');
        setIsCallActive(true);
      });

      vapiInstance.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
      });

      vapiInstance.on('speech-start', () => {
        console.log('User started speaking');
      });

      vapiInstance.on('speech-end', () => {
        console.log('User stopped speaking');
      });

      vapiInstance.on('error', (error: any) => {
        console.error('VAPI Error:', JSON.stringify(error, null, 2));
        if (error?.message) {
          console.error('Error message:', error.message);
          alert(`Voice connection error: ${error.message}`);
        } else {
          alert('Failed to connect to voice service. Please check your microphone permissions.');
        }
        setIsCallActive(false);
      });

      vapiInstance.on('message', async (message: any) => {
        console.log('VAPI Message:', message);
        
        // Handle different message types
        if (message.type === 'transcript' && message.role === 'user') {
          // Save user message
          if (conversationId) {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'user',
              content: message.text
            });
          }
        }
        
        if (message.type === 'function-call' && message.functionCall?.name === 'processWithN8N') {
          // Process with n8n
          const response = await processWithN8N(message.functionCall.parameters);
          return { result: response };
        }
      });

      setVapi(vapiInstance);
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
    }
  };

  const startConversation = async () => {
    if (!agent || !vapi) {
      console.error('Agent or VAPI not initialized');
      return;
    }

    try {
      // Check VAPI is initialized
      if (!vapi) {
        alert('Voice service not initialized. Please refresh the page.');
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        alert('Please log in to start a conversation.');
        return;
      }

      // Create a new conversation if we don't have one
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            agent_id: agent.id,
            user_id: user.id,
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          return;
        }

        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      }

      // Get previous messages for context
      const { data: previousMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      const context = previousMessages?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];

      // Prepare the system message
      const systemMessage = `You are ${agent.name}. ${agent.description}
                
Personality: ${agent.personality}
Response Style: ${agent.response_style}
Company Context: ${agent.company_context || 'N/A'}
Knowledge Base: ${agent.knowledge_base || 'N/A'}

${context.length > 0 ? `Previous conversation context:\n${context.map(m => `${m.role}: ${m.content}`).join('\n')}` : ''}

Important: When you need to process complex requests or access external data, call the processWithN8N function.`;

      console.log('Starting VAPI call...');
      console.log('Agent has VAPI assistant ID:', agent.vapi_assistant_id);
      console.log('Using system message length:', systemMessage.length);

      // Start VAPI call - use assistant ID if available, otherwise create inline
      const vapiConfig: any = agent.vapi_assistant_id 
        ? {
            assistantId: agent.vapi_assistant_id
          }
        : {
            assistant: {
              firstMessage: agent.welcome_message || `Hello! I'm ${agent.name}. How can I help you today?`,
              model: {
                provider: "openai",
                model: "gpt-4",
                systemPrompt: systemMessage,
              },
              voice: {
                provider: "openai",
                model: "tts-1",
                voiceId: "alloy",
              },
              silenceTimeoutSeconds: 30,
              functions: [
                {
                  name: "processWithN8N",
                  description: "Process user request through n8n workflow for complex queries",
                  parameters: {
                    type: "object",
                    properties: {
                      userMessage: { 
                        type: "string",
                        description: "The user's message or request"
                      },
                      agentId: { 
                        type: "string",
                        description: "The ID of the current agent"
                      },
                      conversationId: { 
                        type: "string",
                        description: "The ID of the current conversation"
                      }
                    },
                    required: ["userMessage"]
                  }
                }
              ]
            }
          };
      
      console.log('VAPI config:', JSON.stringify(vapiConfig, null, 2));
      
      try {
        await vapi.start(vapiConfig);
        console.log('VAPI call started successfully');
      } catch (startError) {
        console.error('Error starting VAPI:', startError);
        throw startError;
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please check your VAPI configuration.');
      setIsCallActive(false);
    }
  };

  const endConversation = async () => {
    if (vapi) {
      await vapi.stop();
      setIsCallActive(false);
    }
  };

  const processWithN8N = async (params: any) => {
    try {
      // Call your n8n webhook
      const response = await fetch('/api/webhook/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          agentContext: {
            name: agent?.name,
            personality: agent?.personality,
            knowledge_base: agent?.knowledge_base
          }
        })
      });

      const data = await response.json();
      
      // Save the interaction to database
      if (conversationId) {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: params.userMessage },
          { conversation_id: conversationId, role: 'assistant', content: data.response }
        ]);
      }

      return data.response;
    } catch (error) {
      console.error('Error processing with n8n:', error);
      return "I'm sorry, I encountered an error processing your request.";
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex flex-col items-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-5 w-80 mb-2" />
              <Skeleton className="h-5 w-64 mb-8" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!agent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Agent not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to agents
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
          <p className="text-gray-400">{agent.description}</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 transition-all hover:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-medium text-white">Voice Conversation</h2>
                <span className={`h-2 w-2 rounded-full ${
                  isCallActive ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <p className="text-sm text-gray-400">
                {isCallActive 
                  ? 'Conversation in progress - speak naturally'
                  : 'Click start to begin talking with this agent'
                }
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${
              isCallActive ? 'bg-red-500/10' : ''
            }`}>
              <svg className={`w-6 h-6 ${
                isCallActive ? 'text-red-400' : 'text-gray-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {agent.welcome_message && (
              <div className="rounded-lg bg-gray-900 p-4 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Welcome message</p>
                <p className="text-sm text-gray-300">{agent.welcome_message}</p>
              </div>
            )}

            <button
              onClick={isCallActive ? endConversation : startConversation}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isCallActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white hover:opacity-90 text-black'
              }`}
            >
              {isCallActive ? 'End Conversation' : 'Start Conversation'}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isCallActive ? 'Active' : 'Ready'}
            </span>
            <span>•</span>
            <span>Powered by VAPI</span>
          </div>
        </div>

        {/* Conversation History */}
        <div className="mt-8 bg-gray-950 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recent Conversations</h3>
          <div className="text-sm text-gray-400">
            <p>No previous conversations yet.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}