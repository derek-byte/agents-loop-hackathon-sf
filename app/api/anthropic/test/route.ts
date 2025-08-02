import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'ANTHROPIC_API_KEY not found in environment',
      hint: 'Make sure ANTHROPIC_API_KEY is in your .env.local file'
    }, { status: 500 })
  }

  try {
    console.log('Testing Anthropic API...')
    console.log('API Key length:', apiKey.length)
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...')
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Hello, the API is working!" in exactly those words.'
      }]
    })
    
    const content = response.content[0].type === 'text' ? response.content[0].text : 'No response'
    
    return NextResponse.json({
      success: true,
      response: content,
      usage: response.usage,
      model: response.model
    })
  } catch (error) {
    console.error('Anthropic test error:', error)
    return NextResponse.json({
      error: 'Failed to call Anthropic API',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 })
  }
}