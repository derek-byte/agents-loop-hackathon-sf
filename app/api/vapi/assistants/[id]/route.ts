import { NextResponse } from 'next/server'

// GET a specific VAPI assistant
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  if (!vapiApiKey) {
    return NextResponse.json({ error: 'VAPI_SECRET_KEY not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const assistant = await response.json()
    return NextResponse.json(assistant)
  } catch (error) {
    console.error('Error fetching VAPI assistant:', error)
    return NextResponse.json({ error: 'Failed to fetch assistant' }, { status: 500 })
  }
}

// UPDATE a VAPI assistant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  if (!vapiApiKey) {
    return NextResponse.json({ error: 'VAPI_SECRET_KEY not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    
    // VAPI assistant update structure
    const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('VAPI API error:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const updatedAssistant = await response.json()
    return NextResponse.json(updatedAssistant)
  } catch (error) {
    console.error('Error updating VAPI assistant:', error)
    return NextResponse.json({ error: 'Failed to update assistant' }, { status: 500 })
  }
}

// DELETE a VAPI assistant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  if (!vapiApiKey) {
    return NextResponse.json({ error: 'VAPI_SECRET_KEY not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting VAPI assistant:', error)
    return NextResponse.json({ error: 'Failed to delete assistant' }, { status: 500 })
  }
}