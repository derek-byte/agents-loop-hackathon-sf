import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('VAPI Inbound Call:', body);

    // Extract phone number or other identifiers
    const { call } = body;
    const callerPhone = call?.customer?.number;

    // Look up user and their preferred agent based on phone number
    const supabase = await createClient();
    
    // Example: Find user's last active agent or default agent
    const { data: userAgent } = await supabase
      .from('user_phone_agents')
      .select('*, agents(*)')
      .eq('phone_number', callerPhone)
      .single();

    const agent = userAgent?.agents || {
      name: 'HR Assistant',
      personality: 'professional',
      knowledge_base: 'Default HR knowledge'
    };

    // Return dynamic assistant configuration
    return NextResponse.json({
      assistant: {
        firstMessage: `Hello! This is ${agent.name} from HR. How can I help you today?`,
        model: {
          provider: "openai",
          model: "gpt-4",
          systemPrompt: `You are ${agent.name}. ${agent.description}
            
Personality: ${agent.personality}
Response Style: ${agent.response_style}
Company Context: ${agent.company_context}
Knowledge Base: ${agent.knowledge_base}

Caller Phone: ${callerPhone}
Previous interactions: [Load from database]

Important: Be helpful and professional. When asked complex questions, use the processWithN8N function.`,
        },
        voice: {
          provider: "11labs",
          voiceId: "rachel"
        },
        functions: [
          {
            name: "processWithN8N",
            description: "Process complex requests",
            parameters: {
              type: "object",
              properties: {
                userMessage: { type: "string" },
                callerPhone: { type: "string" },
                agentId: { type: "string" }
              }
            }
          }
        ],
        // Server URL for function calls
        serverUrl: "https://your-app.com/api/vapi/functions"
      }
    });
  } catch (error) {
    console.error('Error handling inbound call:', error);
    return NextResponse.json({
      assistant: {
        firstMessage: "Hello! I'm having trouble accessing your information. How can I help you today?",
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          systemPrompt: "You are a helpful HR assistant. Apologize for technical difficulties and try to help."
        }
      }
    });
  }
}