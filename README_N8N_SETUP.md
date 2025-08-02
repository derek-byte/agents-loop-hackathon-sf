# n8n Integration Setup

This guide explains how to connect your HR Agent Dashboard to n8n for advanced workflow processing.

## How it Works

1. **User speaks to VAPI** → VAPI transcribes the speech
2. **VAPI detects complex request** → Calls the `processWithN8N` function
3. **Your app receives function call** → Forwards to n8n webhook
4. **n8n processes request** → Returns response
5. **VAPI speaks response** → User hears the answer

## Setup Steps

### 1. Configure n8n Webhook

In n8n, create a new workflow:

1. Add a **Webhook** node
   - Set to POST method
   - Copy the webhook URL

2. Add your processing logic (e.g., database lookups, API calls, etc.)

3. Add a **Respond to Webhook** node at the end
   - Return JSON with format:
   ```json
   {
     "response": "Your response text here",
     "processed": true
   }
   ```

### 2. Update Environment Variables

Add your n8n webhook URL to `.env.local`:
```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### 3. How VAPI Triggers n8n

When users say things like:
- "I need help with a complex HR issue"
- "Can you check my vacation balance in the system?"
- "I want to file a complaint"
- "Help me with benefits enrollment"

The assistant will automatically call n8n for processing.

### 4. Testing

1. Create a new agent or use an existing one
2. Start a voice conversation
3. Ask a complex question that needs external data
4. Watch the logs to see the n8n integration in action

## Example n8n Workflows

### Vacation Balance Check
1. Webhook receives employee request
2. Query HR database for remaining days
3. Return formatted response

### Benefits Information
1. Webhook receives benefits query
2. Fetch relevant documents from knowledge base
3. Summarize and return key information

### Ticket Creation
1. Webhook receives complaint/issue
2. Create ticket in help desk system
3. Return ticket number and next steps

## Debugging

Check these logs:
- Browser console: Shows VAPI function calls
- Terminal: Shows webhook requests to n8n
- n8n: Shows incoming webhooks and processing

## Security Notes

- Always validate webhook requests
- Don't expose sensitive data in responses
- Use environment variables for URLs
- Consider adding authentication to webhooks