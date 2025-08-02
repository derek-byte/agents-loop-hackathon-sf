import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward to your n8n webhook
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: body.userMessage,
        agentId: body.agentId,
        conversationId: body.conversationId,
        agentContext: body.agentContext,
        timestamp: new Date().toISOString()
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('n8n webhook failed');
    }

    const data = await n8nResponse.json();
    
    return NextResponse.json({
      response: data.response || "I'll help you with that.",
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { response: "I'm having trouble connecting to my knowledge base. Please try again." },
      { status: 500 }
    );
  }
}