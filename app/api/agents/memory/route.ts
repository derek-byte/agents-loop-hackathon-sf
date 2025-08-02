import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { agentId, userId, message } = await request.json()
    const supabase = await createClient()
    
    // Get user's conversation history with this agent
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3) // Last 3 conversations
    
    // Extract key information from history
    const memoryContext = {
      totalConversations: conversations?.length || 0,
      recentTopics: extractTopics(conversations),
      userPreferences: extractPreferences(conversations),
      previousQuestions: extractQuestions(conversations),
    }
    
    return NextResponse.json({ memoryContext })
  } catch (error) {
    console.error('Error fetching memory:', error)
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
  }
}

function extractTopics(conversations: any[]): string[] {
  const topics = new Set<string>()
  
  conversations?.forEach(conv => {
    conv.messages?.forEach((msg: any) => {
      if (msg.content.toLowerCase().includes('vacation')) topics.add('vacation policy')
      if (msg.content.toLowerCase().includes('benefits')) topics.add('benefits')
      if (msg.content.toLowerCase().includes('payroll')) topics.add('payroll')
      if (msg.content.toLowerCase().includes('insurance')) topics.add('insurance')
      // Add more topic detection as needed
    })
  })
  
  return Array.from(topics)
}

function extractPreferences(conversations: any[]): any {
  // Extract user preferences from conversation history
  const preferences: any = {}
  
  conversations?.forEach(conv => {
    conv.messages?.forEach((msg: any) => {
      // Look for preferences mentioned
      if (msg.role === 'user') {
        // Example: Extract family info
        const kidsMatch = msg.content.match(/(\d+)\s*(kids?|children)/i)
        if (kidsMatch) preferences.numberOfChildren = kidsMatch[1]
        
        // Extract other preferences...
      }
    })
  })
  
  return preferences
}

function extractQuestions(conversations: any[]): string[] {
  const questions: string[] = []
  
  conversations?.forEach(conv => {
    conv.messages?.filter((msg: any) => msg.role === 'user')
      .slice(-5) // Last 5 questions
      .forEach((msg: any) => {
        if (msg.content.includes('?')) {
          questions.push(msg.content)
        }
      })
  })
  
  return questions
}