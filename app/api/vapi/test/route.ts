import { NextResponse } from 'next/server'

export async function GET() {
  const vapiSecretKey = process.env.VAPI_SECRET_KEY
  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  
  if (!vapiSecretKey || !vapiPublicKey) {
    return NextResponse.json({
      error: 'VAPI keys not configured',
      hasSecretKey: !!vapiSecretKey,
      hasPublicKey: !!vapiPublicKey
    }, { status: 500 })
  }

  try {
    // Test VAPI API connection by fetching assistants
    const response = await fetch('https://api.vapi.ai/assistant', {
      headers: {
        'Authorization': `Bearer ${vapiSecretKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({
        error: 'VAPI API error',
        status: response.status,
        message: error
      }, { status: response.status })
    }

    const assistants = await response.json()
    
    return NextResponse.json({
      success: true,
      publicKey: vapiPublicKey,
      assistantCount: assistants.length,
      message: 'VAPI configuration is valid'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to connect to VAPI',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}