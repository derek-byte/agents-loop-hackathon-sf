import { NextResponse } from 'next/server'

export async function POST() {
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  if (!vapiApiKey) {
    return NextResponse.json({ error: 'VAPI_SECRET_KEY not configured' }, { status: 500 })
  }

  try {
    // Create a minimal test assistant
    const testPayload = {
      name: 'Test Assistant',
      firstMessage: 'Hello, this is a test assistant.',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'You are a test assistant. Be helpful and concise.',
      },
      voice: {
        provider: '11labs',
        voiceId: 'rachel',
      },
    }
    
    console.log('Creating test VAPI assistant...')
    
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    console.log('VAPI Response status:', response.status)
    const responseText = await response.text()
    console.log('VAPI Response:', responseText)
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'VAPI API error',
        status: response.status,
        details: responseText
      }, { status: response.status })
    }
    
    try {
      const assistant = JSON.parse(responseText)
      return NextResponse.json({
        success: true,
        assistant: {
          id: assistant.id,
          name: assistant.name,
          createdAt: assistant.createdAt
        }
      })
    } catch (parseError) {
      return NextResponse.json({
        error: 'Failed to parse VAPI response',
        responseText
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating test assistant:', error)
    return NextResponse.json({
      error: 'Failed to create test assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}