# INFINIXLOOP

Plateforme SaaS d'agents IA autonomes pour automatiser votre business digital.

## Stack

- **Framework** : Next.js 16 (App Router, Turbopack)
- **UI** : React 19, Tailwind CSS 4, Lucide Icons
- **Auth & Backend** : Supabase (Auth, PostgreSQL, RLS)
- **Deploy** : Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local   # remplir les variables Supabase
npm run dev
```

## Structure

```
src/
  app/           # Pages (landing, auth, dashboard)
  components/    # Sidebar, Topbar, DashboardShell, ExecutionSteps
  lib/           # Auth context, Supabase clients, settings store, agents data
  agents/        # Webmaster agent (types, config, steps, runner)
supabase/
  schema.sql     # Tables: profiles, conversations, messages, agent_configs, outputs, analytics, user_api_keys
```

## Features

- 12 agents IA specialises (Informateur, Redacteur, Scriptwriter, Webmaster, etc.)
- Orchestrateur chat avec selection d'agent
- Agent Webmaster avec execution pas-a-pas visuelle
- Parametres API keys (Supabase + localStorage fallback)
- Auth Supabase (login, signup, middleware)
- Design responsive mobile-first
- Analytics dashboard
