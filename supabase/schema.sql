-- ═══════════════════════════════════════════════════════
-- InfinixLoop — Supabase Database Schema
-- ═══════════════════════════════════════════════════════

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Conversations (chat sessions)
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'Nouveau projet',
  agent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "Users can CRUD own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'ai', 'system')),
  content text not null,
  agent_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users can CRUD own messages" on public.messages
  for all using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

-- Agent configs (user-specific agent settings)
create table if not exists public.agent_configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  agent_id text not null,
  config jsonb default '{}',
  is_active boolean default false,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, agent_id)
);

alter table public.agent_configs enable row level security;
create policy "Users can CRUD own agent configs" on public.agent_configs
  for all using (auth.uid() = user_id);

-- Outputs (generated content)
create table if not exists public.outputs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  conversation_id uuid references public.conversations(id) on delete set null,
  agent_id text not null,
  type text not null check (type in ('ebook', 'video', 'content', 'page', 'email', 'image', 'chatbot', 'project')),
  title text not null,
  description text,
  content text,
  file_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.outputs enable row level security;
create policy "Users can CRUD own outputs" on public.outputs
  for all using (auth.uid() = user_id);

-- Analytics events
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  agent_id text not null,
  event_type text not null check (event_type in ('run', 'output', 'error')),
  duration_ms integer,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;
create policy "Users can read own analytics" on public.analytics_events
  for select using (auth.uid() = user_id);
create policy "Users can insert own analytics" on public.analytics_events
  for insert with check (auth.uid() = user_id);

-- User API keys (encrypted storage for third-party API keys)
create table if not exists public.user_api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  key_name text not null,
  key_value text not null,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, key_name)
);

alter table public.user_api_keys enable row level security;
create policy "Users can CRUD own api keys" on public.user_api_keys
  for all using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_conversations_user on public.conversations(user_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_outputs_user on public.outputs(user_id);
create index if not exists idx_outputs_type on public.outputs(type);
create index if not exists idx_analytics_user on public.analytics_events(user_id);
create index if not exists idx_analytics_agent on public.analytics_events(agent_id);
