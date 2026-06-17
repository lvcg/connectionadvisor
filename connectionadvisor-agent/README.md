# ConnectionAdvisor ElizaOS Agent

This folder contains the ConnectionCoach character and a lightweight bridge contract for connecting the React app to an ElizaOS runtime.

The default setup uses Ollama so the agent can run local models without committing or managing cloud LLM keys.

## Create the Agent Project

Install the ElizaOS CLI:

```bash
bun i -g @elizaos/cli
```

Install Ollama from:

```text
https://ollama.com/download
```

Pull the recommended local models:

```bash
ollama pull llama3.2
ollama pull llama3.1
ollama pull nomic-embed-text
```

Create a new ElizaOS project:

```bash
elizaos create
```

Recommended setup:

- Database: `pglite`
- Model provider: Ollama
- Character: copy `characters/connection-coach.character.ts` into the generated ElizaOS project

Add the Ollama plugin inside the generated ElizaOS project:

```bash
elizaos plugins add @elizaos/plugin-ollama
```

Start the agent:

```bash
elizaos start
```

## Environment

Copy `.env.example` to `.env` inside the generated ElizaOS project:

```bash
PGLITE_DATA_DIR=.eliza/.elizadb
OLLAMA_API_ENDPOINT=http://localhost:11434/api
OLLAMA_SMALL_MODEL=llama3.2
OLLAMA_MEDIUM_MODEL=llama3.1
OLLAMA_LARGE_MODEL=llama3.1
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_TEMPERATURE=0.7
```

Never commit `.env` files. If you later add cloud model providers, keep those keys server-side only.

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
