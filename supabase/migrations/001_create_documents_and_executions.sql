-- Documents (generated files: carousels, PDFs, images)
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  type text not null check (type in ('carousel', 'pdf', 'image', 'report')),
  title text not null,
  description text,
  file_url text,
  content jsonb default '{}',
  metadata jsonb default '{}',
  infinixui_project_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.documents enable row level security;

drop policy if exists "Users can CRUD own documents" on public.documents;
create policy "Users can CRUD own documents" on public.documents
  for all using (auth.uid() = user_id);

create index if not exists idx_documents_user on public.documents(user_id);
create index if not exists idx_documents_type on public.documents(type);

-- Agent executions (for pause/resume confirmation flow)
create table if not exists public.agent_executions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  status text not null default 'running' check (status in ('running', 'awaiting_confirmation', 'confirmed', 'cancelled', 'completed', 'error')),
  context jsonb default '{}',
  generated_content jsonb default '{}',
  steps jsonb default '[]',
  confirmation_channel text check (confirmation_channel in ('email', 'slack', 'notion')),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  user_modifications jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.agent_executions enable row level security;

drop policy if exists "Users can CRUD own executions" on public.agent_executions;
create policy "Users can CRUD own executions" on public.agent_executions
  for all using (auth.uid() = user_id);

create index if not exists idx_executions_user on public.agent_executions(user_id);
create index if not exists idx_executions_status on public.agent_executions(status);
