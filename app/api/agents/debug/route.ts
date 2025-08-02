import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all agents with their VAPI assistant IDs
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, vapi_assistant_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check table columns
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { table_name: 'agents' })
    .single()

  return NextResponse.json({
    agents: agents?.map(a => ({
      id: a.id,
      name: a.name,
      vapi_assistant_id: a.vapi_assistant_id,
      has_vapi: !!a.vapi_assistant_id,
      created_at: a.created_at
    })),
    vapi_config: {
      has_secret_key: !!process.env.VAPI_SECRET_KEY,
      has_public_key: !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
      has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'not set'
    },
    columns_error: columnsError?.message
  })
}