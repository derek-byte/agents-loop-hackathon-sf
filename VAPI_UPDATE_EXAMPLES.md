# VAPI Assistant Update Examples

## Updating System Prompt

You can update a VAPI assistant's system prompt using the API. Here are several ways to do it:

### 1. Using the API Endpoint (Recommended)

```javascript
// Update just the system prompt
const response = await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: {
      systemPrompt: "Your new system prompt here"
    }
  })
});

const updatedAssistant = await response.json();
```

### 2. Update Multiple Properties

```javascript
// Update system prompt along with other properties
const response = await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Updated Assistant Name",
    firstMessage: "New welcome message",
    model: {
      systemPrompt: "Updated system prompt with new instructions",
      temperature: 0.8,
      maxTokens: 200
    },
    voice: {
      provider: "openai",
      model: "tts-1",
      voiceId: "nova" // Change voice to nova
    }
  })
});
```

### 3. Direct VAPI API Call

```bash
# Using curl to update directly
curl -X PATCH https://api.vapi.ai/assistant/YOUR_ASSISTANT_ID \
  -H "Authorization: Bearer YOUR_VAPI_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": {
      "systemPrompt": "Your new system prompt"
    }
  }'
```

### 4. Update System Prompt with Context

```javascript
// Include conversation history in system prompt
const conversationHistory = await fetchUserConversations(userId);
const contextualPrompt = `
${baseSystemPrompt}

PREVIOUS CONVERSATIONS:
${conversationHistory}

Remember to reference past interactions when relevant.
`;

const response = await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: {
      systemPrompt: contextualPrompt
    }
  })
});
```

## Available Update Fields

You can update any of these fields on a VAPI assistant:

```typescript
{
  // Basic Info
  name: string,
  firstMessage: string,
  
  // Model Configuration
  model: {
    provider: "openai" | "anthropic" | "groq" | "deepgram",
    model: string, // e.g., "gpt-4", "claude-3-5-sonnet"
    systemPrompt: string,
    temperature: number, // 0-2
    maxTokens: number,
    emotionRecognitionEnabled: boolean,
    numFastTurns: number
  },
  
  // Voice Configuration
  voice: {
    provider: "openai" | "elevenlabs" | "deepgram",
    model: string,
    voiceId: string,
    speed: number,
    stability: number, // For ElevenLabs
    similarityBoost: number // For ElevenLabs
  },
  
  // Conversation Settings
  silenceTimeoutSeconds: number,
  responseDelaySeconds: number,
  llmRequestDelaySeconds: number,
  
  // Advanced Features
  functions: Array,
  serverUrl: string,
  serverUrlSecret: string,
  
  // Analysis
  analysisPlan: {
    summaryPrompt: string,
    structuredDataSchema: object
  }
}
```

## Integration with Agent Updates

When you update an agent in your dashboard, it automatically updates the VAPI assistant if the system prompt changes:

```javascript
// This happens automatically in /api/agents/[id]/route.ts
const updateAgent = async (agentId, updates) => {
  // Update in database
  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_prompt: "New enhanced prompt",
      // ... other updates
    })
  });
  
  // VAPI assistant is automatically updated if system_prompt changed
};
```

## Testing Updates

1. Get current assistant configuration:
```javascript
const response = await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID');
const assistant = await response.json();
console.log('Current prompt:', assistant.model.systemPrompt);
```

2. Update the system prompt:
```javascript
await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: {
      systemPrompt: "Updated prompt with new capabilities"
    }
  })
});
```

3. Verify the update:
```javascript
const updated = await fetch('/api/vapi/assistants/YOUR_ASSISTANT_ID');
const result = await updated.json();
console.log('Updated prompt:', result.model.systemPrompt);
```

## Notes

- Updates are immediate and affect ongoing calls
- Always test prompt changes before deploying
- Keep prompts concise for better performance
- Include clear instructions for function calling
- Consider token limits when adding context