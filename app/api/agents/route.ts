import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// GET all agents for current user
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(agents)
}

// POST create new agent
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // First, create the agent in database
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Then, create a VAPI assistant for this agent
    try {
      console.log('Creating VAPI assistant for agent:', agent.id)
      const vapiAssistant = await createVAPIAssistant(agent)
      
      // Update agent with VAPI assistant ID
      if (vapiAssistant?.id) {
        console.log('VAPI assistant created with ID:', vapiAssistant.id)
        
        const { error: updateError } = await supabase
          .from('agents')
          .update({ 
            vapi_assistant_id: vapiAssistant.id 
          })
          .eq('id', agent.id)
        
        if (updateError) {
          console.error('Failed to update agent with VAPI ID:', updateError)
        } else {
          console.log('Successfully updated agent with VAPI assistant ID')
          // Return agent with VAPI assistant ID
          agent.vapi_assistant_id = vapiAssistant.id
        }
      } else {
        console.warn('VAPI assistant creation returned no ID')
      }
    } catch (vapiError) {
      console.error('Failed to create VAPI assistant:', vapiError)
      // Continue - agent is created even if VAPI fails
    }

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// Helper function to create VAPI assistant
async function createVAPIAssistant(agent: any) {
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  console.log('createVAPIAssistant called for agent:', agent.name)
  console.log('VAPI_SECRET_KEY exists:', !!vapiApiKey)
  
  if (!vapiApiKey) {
    console.error('VAPI_SECRET_KEY not configured')
    return null
  }

  try {
    // Use the system prompt from the agent (already enhanced by Claude in the frontend)
    const systemPrompt = agent.system_prompt || buildFallbackPrompt(agent)

    // Create VAPI assistant
    const vapiPayload = {
      name: agent.name,
      firstMessage: agent.welcome_message || `Hello! I'm ${agent.name}. How can I help you today?`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 150,
      },
      voice: {
        provider: 'openai',
        model: 'tts-1',
        voiceId: 'alloy',
      },
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 0.4,
      llmRequestDelaySeconds: 0.1,
      functions: [
        {
          name: 'processWithN8N',
          description: 'Process complex requests through n8n workflow',
          parameters: {
            type: 'object',
            properties: {
              userMessage: {
                type: 'string',
                description: 'The user\'s message or request'
              },
              agentId: {
                type: 'string',
                description: 'The ID of the current agent'
              },
              context: {
                type: 'object',
                description: 'Additional context for processing'
              }
            },
            required: ['userMessage']
          }
        }
      ],
      serverUrl: process.env.NEXT_PUBLIC_APP_URL ? 
        `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/webhook/${agent.id}` : 
        undefined,
    }
    
    console.log('Creating VAPI assistant with payload:', JSON.stringify(vapiPayload, null, 2))
    
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiPayload)
    })

    console.log('VAPI API Response status:', assistantResponse.status)
    
    if (!assistantResponse.ok) {
      const errorText = await assistantResponse.text()
      console.error('VAPI API error response:', errorText)
      throw new Error(`VAPI API error (${assistantResponse.status}): ${errorText}`)
    }

    const assistant = await assistantResponse.json()
    console.log('VAPI assistant created successfully:', assistant)
    console.log('Assistant ID:', assistant.id)
    
    return assistant
  } catch (error) {
    console.error('Error creating VAPI assistant:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}

// Helper function to build fallback prompt when Anthropic is not available
function buildFallbackPrompt(agent: any): string {
  return `You are ${agent.name}. ${agent.description || ''}

Personality: ${agent.personality || 'professional'}
Response Style: ${agent.response_style || 'balanced'}
${agent.company_context ? `\nCompany Context:\n${agent.company_context}` : ''}
${agent.knowledge_base ? `\nKnowledge Base:\n${agent.knowledge_base}` : ''}

Important guidelines:
- Always be helpful and professional
- Stay in character as defined by the personality and response style
- Use the company context and knowledge base to provide accurate information
- If you don't know something, be honest about it
- For complex queries that need external processing, use the processWithN8N function`
}