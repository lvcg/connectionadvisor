# ConnectionAdvisor ElizaOS Agent

This folder contains the ConnectionCoach character and a lightweight bridge contract for connecting the React app to an ElizaOS runtime.

## Create the Agent Project

Install the ElizaOS CLI:

```bash
bun i -g @elizaos/cli
```

Create a new ElizaOS project:

```bash
elizaos create
```

Recommended setup:

- Database: `pglite`
- Model provider: OpenAI
- Character: copy `characters/connection-coach.character.ts` into the generated ElizaOS project

Start the agent:

```bash
elizaos start
```

## Environment

Copy `.env.example` to `.env` inside the generated ElizaOS project and add your own key:

```bash
OPENAI_API_KEY=your_key_here
PGLITE_DATA_DIR=.eliza/.elizadb
```

Never commit `.env` files or real API keys.

## Frontend Bridge

The React app expects a small HTTP bridge at:

```text
POST /connection-advice
```

Set the React app URL in its `.env` file:

```bash
REACT_APP_ELIZAOS_URL=http://localhost:3001
```

Expected request body:

```json
{
  "connection": {},
  "localAdvice": {}
}
```

Expected response body:

```json
{
  "recommendation": "What to do next",
  "message": "A message the user can send",
  "dateIdea": "A specific date plan",
  "topics": ["Conversation topic"],
  "safety": "Boundary or safety reminder"
}
```

Until that bridge is running, the app uses its local coach fallback.
