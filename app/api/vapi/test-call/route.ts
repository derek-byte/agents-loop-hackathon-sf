import { NextResponse } from 'next/server'

export async function POST() {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  
  if (!publicKey) {
    return NextResponse.json({ error: 'VAPI public key not configured' }, { status: 500 })
  }

  try {
    // Test minimal web call configuration
    const testConfig = {
      assistant: {
        firstMessage: "Hello! This is a test call.",
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          systemPrompt: "You are a helpful test assistant. Be brief.",
        },
        voice: {
          provider: "openai",
          model: "tts-1",
          voice: "alloy",
        },
      }
    }
    
    return NextResponse.json({
      message: 'Use this configuration in your VAPI client',
      publicKey,
      config: testConfig,
      notes: [
        'Make sure microphone permissions are granted',
        'HTTPS is required for production',
        'Check browser console for VAPI errors'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to prepare test configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}