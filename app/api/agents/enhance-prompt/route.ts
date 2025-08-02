import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const { agentInfo } = await request.json()
    
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }
    
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Create a prompt to generate a comprehensive system prompt like the example
    const enhancementPrompt = `You are an expert at creating detailed voice assistant prompts for VAPI. Given the following information about an HR agent, create a comprehensive system prompt similar to the appointment scheduling example provided.

Agent Information:
- Name: ${agentInfo.name}
- Description: ${agentInfo.description}
- Personality: ${agentInfo.personality}
- Response Style: ${agentInfo.response_style}
- Company Context: ${agentInfo.company_context || 'Not specified'}
- Knowledge Base: ${agentInfo.knowledge_base || 'Not specified'}
- Welcome Message: ${agentInfo.welcome_message || 'Default greeting'}

Create a detailed system prompt that includes:
1. Identity & Purpose section
2. Voice & Persona section with personality and speech characteristics
3. Conversation Flow section with introduction, information gathering, and wrap-up
4. Response Guidelines
5. Scenario Handling for common HR situations
6. Knowledge Base section with relevant HR information
7. Call Management guidelines

The prompt should be specific to HR assistance and the agent's defined personality and capabilities. Format it exactly like the appointment scheduling example but adapted for HR contexts.

Example structure to follow:

# [Agent Name] - HR Assistant Prompt

## Identity & Purpose
[Define who the agent is and their primary purpose]

## Voice & Persona
### Personality
[Define personality traits based on the agent's configuration]

### Speech Characteristics
[Define how they should speak]

## Conversation Flow
### Introduction
[Opening greeting and how to start conversations]

### Information Gathering
[How to collect employee information and understand their needs]

### HR Process Handling
[Steps for handling common HR requests]

### Wrap-up
[How to conclude conversations]

## Response Guidelines
[Key guidelines for responses]

## Scenario Handling
### For Benefits Questions
[How to handle benefits inquiries]

### For Policy Questions
[How to handle policy-related questions]

### For Leave Requests
[How to handle time-off and leave requests]

### For Payroll Issues
[How to handle payroll-related concerns]

## Knowledge Base
[Relevant HR information based on company context and knowledge base]

## Call Management
[How to handle call flow and technical issues]

Make the prompt comprehensive, professional, and tailored to the specific agent's configuration.`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: enhancementPrompt
        }
      ]
    })

    const enhancedPrompt = response.content[0].type === 'text' ? response.content[0].text : ''
    
    console.log('Successfully enhanced prompt for agent:', agentInfo.name)
    
    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    console.error('Error enhancing prompt:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to enhance prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}