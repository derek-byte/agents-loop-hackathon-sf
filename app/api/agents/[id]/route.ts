import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE agent
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// UPDATE agent
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Update agent in database
    const { data: agent, error } = await supabase
      .from('agents')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If system_prompt was updated and agent has VAPI assistant, update VAPI too
    if (body.system_prompt && agent.vapi_assistant_id) {
      console.log('Updating VAPI assistant system prompt...')
      const vapiUpdated = await updateVAPIAssistant(agent.vapi_assistant_id, {
        model: {
          systemPrompt: body.system_prompt
        }
      })
      
      if (vapiUpdated) {
        console.log('VAPI assistant updated successfully')
      } else {
        console.log('Failed to update VAPI assistant')
      }
    }

    return NextResponse.json(agent)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// Helper function to update VAPI assistant
async function updateVAPIAssistant(assistantId: string, updates: any) {
  const vapiApiKey = process.env.VAPI_SECRET_KEY
  
  if (!vapiApiKey) {
    console.error('VAPI_SECRET_KEY not configured')
    return false
  }

  try {
    console.log(`Updating VAPI assistant ${assistantId} with:`, JSON.stringify(updates, null, 2))
    
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('VAPI API error response:', errorText)
      throw new Error(`VAPI API error (${response.status}): ${errorText}`)
    }

    const updatedAssistant = await response.json()
    console.log('VAPI assistant updated:', updatedAssistant)
    
    return true
  } catch (error) {
    console.error('Error updating VAPI assistant:', error)
    return false
  }
}