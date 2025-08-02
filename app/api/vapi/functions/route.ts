import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('VAPI function call received:', body)
    
    // Extract the function call details
    const { message } = body
    
    if (message?.type === 'function-call') {
      const functionName = message.functionCall?.name
      const parameters = message.functionCall?.parameters
      
      console.log(`Function called: ${functionName}`, parameters)
      
      // Handle different functions
      switch (functionName) {
        case 'processWithN8N':
          return await handleN8NProcess(parameters)
        
        case 'addDocument':
          return await handleAddDocument(parameters)
        
        default:
          return NextResponse.json({
            result: `Unknown function: ${functionName}`
          })
      }
    }
    
    return NextResponse.json({
      result: 'No function call detected'
    })
  } catch (error) {
    console.error('Error handling VAPI function:', error)
    return NextResponse.json({
      result: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleN8NProcess(params: any) {
  const { userMessage, agentId, context } = params
  
  try {
    // Get conversation history from Supabase
    const supabase = await createClient()
    let conversationHistory = ''
    
    if (agentId) {
      // Get user info from the current session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch previous conversations
        const { data: conversations } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            messages (
              role,
              content,
              created_at
            )
          `)
          .eq('agent_id', agentId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (conversations && conversations.length > 0) {
          conversationHistory = 'Previous conversations:\n'
          conversations.forEach(conv => {
            if (conv.messages && conv.messages.length > 0) {
              conv.messages.slice(-5).forEach((msg: any) => {
                conversationHistory += `${msg.role}: ${msg.content}\n`
              })
            }
          })
        }
      }
    }
    
    // Use the agent-response webhook for processing user queries
    const n8nWebhookUrl = 'https://adrian-ctluk.app.n8n.cloud/webhook/agent-response'
    
    console.log('Calling n8n agent-response webhook with conversation history...')
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: userMessage,
        agentId: agentId,
        context: context,
        conversationHistory: conversationHistory,
        timestamp: new Date().toISOString()
      })
    })
    
    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`)
    }
    
    const n8nData = await n8nResponse.json()
    console.log('n8n response:', n8nData)
    
    // Save to database if needed
    if (agentId) {
      const supabase = await createClient()
      await supabase.from('n8n_interactions').insert({
        agent_id: agentId,
        user_message: userMessage,
        n8n_response: n8nData,
        created_at: new Date().toISOString()
      })
    }
    
    // Return the response to VAPI
    return NextResponse.json({
      result: n8nData.response || n8nData.message || "I've processed your request through our advanced system."
    })
  } catch (error) {
    console.error('Error calling n8n:', error)
    return NextResponse.json({
      result: "I encountered an error processing your request. Please try again."
    })
  }
}

async function handleAddDocument(params: any) {
  const { document, agentId } = params
  
  try {
    // Use the add-documents webhook
    const n8nWebhookUrl = 'https://adrian-ctluk.app.n8n.cloud/webhook/add-documents'
    
    console.log('Calling n8n add-documents webhook...')
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: document,
        agentId: agentId,
        timestamp: new Date().toISOString()
      })
    })
    
    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`)
    }
    
    const n8nData = await n8nResponse.json()
    console.log('n8n add-document response:', n8nData)
    
    return NextResponse.json({
      result: n8nData.response || "Document has been successfully added to the knowledge base."
    })
  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json({
      result: "I couldn't add the document at this time. Please try again."
    })
  }
}