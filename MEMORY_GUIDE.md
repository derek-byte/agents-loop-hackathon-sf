# Memory System Guide

## How Memory Works in Your Voice Agents

### 1. **In-Call Memory (Short-term)**
- VAPI maintains context during active call
- Remembers everything said in current conversation
- Lost when call ends

### 2. **Database Memory (Long-term)**
- All conversations saved to Supabase
- Organized by user and agent
- Can be retrieved for future calls

### 3. **n8n Integration Memory**
- n8n can access full conversation history
- Can query external databases
- Maintains user-specific context

## Memory Layers

```
┌─────────────────────────────────────┐
│         VAPI (Active Call)          │
│    - Current conversation context   │
│    - Real-time memory              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Supabase Database              │
│    - All conversations saved        │
│    - User preferences               │
│    - Historical context             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         n8n Workflows               │
│    - Access to all data             │
│    - External integrations          │
│    - Complex memory operations      │
└─────────────────────────────────────┘
```

## Current Implementation

### What's Saved:
- User messages (transcripts)
- Assistant responses
- Timestamps
- User-Agent associations

### What's Retrieved:
- System prompt includes basic context
- n8n can access full history

## Enhanced Memory Features

### 1. **User Profile Memory**
```javascript
// Automatically remembered across calls:
- Number of children
- Department
- Previous issues
- Preferences
```

### 2. **Contextual Awareness**
```javascript
// Agent knows:
- Topics discussed before
- Unresolved issues
- Follow-up items
- User's communication style
```

### 3. **Smart Continuity**
- "Last time you asked about vacation days..."
- "Following up on your benefits question..."
- "I remember you have 3 children..."

## How to Test Memory

1. **First Call:**
   - "I have 2 kids and work in Engineering"
   - "What's the vacation policy?"

2. **Second Call (same agent):**
   - "How many vacation days do I get?" 
   - (Agent should remember you work in Engineering)

3. **Ask n8n for History:**
   - "What did we discuss last time?"
   - "Summarize my previous questions"

## n8n Memory Workflows

### Workflow 1: Context Retrieval
When user asks question → n8n:
1. Fetches user's conversation history
2. Extracts relevant context
3. Provides personalized answer

### Workflow 2: Memory Update
When important info mentioned → n8n:
1. Identifies key facts (kids, department, etc.)
2. Updates user profile
3. Confirms understanding

## Best Practices

### For Developers:
1. Always save both user and assistant messages
2. Include metadata (timestamps, context)
3. Implement conversation summaries
4. Use n8n for complex memory operations

### For Users:
1. Mention important details naturally
2. Reference previous conversations
3. Ask agents to remember specific things
4. Use consistent agent for related topics

## Privacy & Security

- All conversations encrypted in database
- User-specific isolation (Row Level Security)
- No cross-user memory leakage
- Users can request data deletion

## Future Enhancements

1. **Conversation Summaries**
   - Auto-summarize after each call
   - Key points extraction

2. **Smart Reminders**
   - "You asked about this 2 weeks ago..."
   - Follow-up on unresolved issues

3. **Learning System**
   - Improve responses based on feedback
   - Adapt to user preferences

4. **Cross-Agent Memory**
   - Share context between specialized agents
   - Unified user profile