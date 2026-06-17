# ConnectionAdvisor

ConnectionAdvisor is a private dating concierge that helps people make better dating decisions. Add a connection, capture what you know, and get practical recommendations for messages, conversation topics, date-night ideas, and safety reminders.

## What It Does

- Saves dating connections in the browser with localStorage.
- Scores a connection based on context depth, consistency, and aligned goals.
- Suggests what to do next: message, plan, keep it light, or gather more signal.
- Generates message ideas based on stage, interests, and location.
- Suggests date-night plans by mood, budget, and interests.
- Includes practical dating tips and safety reminders.

## Screens

- **Advisor**: compatibility score, recommendation, suggested message, topics, and boundaries.
- **AI Coach**: ElizaOS-ready coach response with a local fallback when the agent bridge is not running.
- **Date Ideas**: best-fit plan plus low-key, creative, food, outdoorsy, romantic, and rainy-day options.
- **Tips**: quick advice cards for messaging, planning, and emotional clarity.

## Tech Stack

- React 18
- Create React App
- CSS modules via `App.css`
- Browser localStorage for the first MVP
- ElizaOS agent scaffold in `connectionadvisor-agent`

The current MVP runs client-side first so the product can be tested immediately. A good next step is to replace localStorage with Supabase Auth, Postgres tables, and an Edge Function for API-backed AI advice.

## Getting Started

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

## ElizaOS Setup

This repo includes an ElizaOS-ready dating coach scaffold:

```text
connectionadvisor-agent/
```

It contains:

- `characters/connection-coach.character.ts`: the ConnectionCoach agent personality, safety boundaries, style, and examples.
- `.env.example`: placeholder environment variables for an ElizaOS project.
- `README.md`: setup notes for creating and running the ElizaOS runtime.

The React app has an **AI Coach** tab. By default it uses a local fallback so the product works immediately. To connect a running ElizaOS bridge, create a local `.env` file:

```bash
REACT_APP_ELIZAOS_URL=http://localhost:3001
```

The frontend expects:

```text
POST /connection-advice
```

See `connectionadvisor-agent/README.md` for the bridge contract and ElizaOS project setup.

## Product Direction

The best version of ConnectionAdvisor is not another swipe app. It is a private helper for people who are already matching, texting, dating, and deciding what to do next.

Future upgrades:

- Supabase-backed saved connections per user.
- Supabase Edge Function for secure AI and ElizaOS bridge calls.
- AI-powered profile bio and prompt coach.
- Place recommendations using a location API.
- Weather-aware date plans.
- Date journal with green flags, yellow flags, and follow-up reminders.
- Message tone controls: playful, direct, warm, or low-pressure.
