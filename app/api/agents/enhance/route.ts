import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const { agent } = await request.json()
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('No Anthropic API key, returning original agent data')
      return NextResponse.json(agent)
    }
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
    
    // Create a prompt to enhance the agent
    const prompt = `Given this HR agent configuration, enhance it with a more detailed system prompt and improved welcome message.

Agent details:
- Name: ${agent.name}
- Description: ${agent.description}
- Personality: ${agent.personality}
- Response Style: ${agent.response_style}
- Company Context: ${agent.company_context || 'Not provided'}
- Knowledge Base: ${agent.knowledge_base || 'Not provided'}

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "enhanced_system_prompt": "A comprehensive system prompt for the voice assistant",
  "enhanced_welcome_message": "An improved welcome message",
  "enhanced_description": "A more detailed description if needed"
}

Make the system prompt detailed and professional, similar to high-quality voice assistant prompts. Ensure all quotes in the JSON values are properly escaped.`

    console.log('Calling Claude to enhance agent...')
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    console.log('Claude response received')
    
    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Try to parse JSON from the response
    try {
      // Extract JSON more carefully, handling nested quotes and special characters
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        // Clean up common issues
        const cleanJson = jsonString
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\t/g, ' ') // Replace tabs with spaces
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();
        
        const enhancements = JSON.parse(cleanJson);
        
        // Merge enhancements with original agent data
        return NextResponse.json({
          ...agent,
          system_prompt: enhancements.enhanced_system_prompt || agent.system_prompt,
          welcome_message: enhancements.enhanced_welcome_message || agent.welcome_message,
          description: enhancements.enhanced_description || agent.description,
        })
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError)
      console.log('Response text:', responseText.substring(0, 500) + '...')
    }
    
    // If parsing fails, return original agent
    return NextResponse.json(agent)
    
  } catch (error) {
    console.error('Error enhancing agent:', error)
    // Return original agent data if enhancement fails
    // Can't read body twice, just return error
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 })
  }
}