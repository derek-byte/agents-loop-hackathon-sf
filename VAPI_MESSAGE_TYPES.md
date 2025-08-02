# VAPI Message Types Reference

## Message Types the Dashboard Handles

### 1. Transcript Messages
These contain the actual conversation content:
```javascript
{
  type: 'transcript',
  role: 'user' | 'assistant',
  text: 'The message content',
  // Additional fields may include:
  timestamp: '2024-01-10T12:00:00Z',
  transcriptId: 'unique-id'
}
```

### 2. Function Call Messages
When VAPI needs to call external functions:
```javascript
{
  type: 'function-call',
  functionCall: {
    name: 'processWithN8N',
    parameters: {
      userMessage: 'user query',
      agentId: 'agent-id',
      context: {}
    }
  }
}
```

## Common VAPI Events

1. **call-start** - Call initiated
2. **call-end** - Call terminated  
3. **speech-start** - User started speaking
4. **speech-end** - User stopped speaking
5. **volume-level** - Audio volume updates
6. **error** - Error occurred
7. **message** - Various message types

## Debugging Conversation Saving

To verify conversations are being saved:

1. Check browser console for:
   - "📨 VAPI Message: transcript"
   - "Saving user/assistant message:"
   - "Using conversation ID: [uuid]"
   - "✅ Successfully saved"

2. Check Supabase messages table:
   ```sql
   SELECT * FROM messages 
   WHERE conversation_id = 'your-conversation-id'
   ORDER BY created_at DESC;
   ```

3. Check conversations table:
   ```sql
   SELECT * FROM conversations
   WHERE agent_id = 'your-agent-id'
   ORDER BY created_at DESC;
   ```

## Troubleshooting

If messages aren't saving:
1. Ensure conversation ID is created before speaking
2. Check for console errors about Supabase inserts
3. Verify the message has both `type: 'transcript'` and a `role`
4. Confirm the `text` field contains the message content