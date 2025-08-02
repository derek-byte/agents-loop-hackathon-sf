import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { assistantId } = await request.json()
    const apiKey = process.env.VAPI_SECRET_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'VAPI API key not configured' }, { status: 500 })
    }
    
    // Validate the assistant exists
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ 
        valid: false, 
        error: `Assistant not found: ${error}` 
      }, { status: 404 })
    }
    
    const assistant = await response.json()
    
    return NextResponse.json({
      valid: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
        voice: assistant.voice,
        createdAt: assistant.createdAt
      }
    })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}