
-- 1) Enum de statut client
do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type public.client_status as enum ('active','paused','at_risk','onboarding','archived');
  end if;
end$$;

-- 2) Évolution table clients
alter table public.clients
  add column if not exists status public.client_status not null default 'active',
  add column if not exists segment text,
  add column if not exists account_manager_id uuid references public.profiles(id) on delete set null,
  add column if not exists domain text,
  add column if not exists mrr numeric not null default 0,
  add column if not exists health_score integer not null default 100,
  add column if not exists flags text[] not null default '{}'::text[],
  add column if not exists integrations jsonb not null default '{}'::jsonb,
  add column if not exists last_activity_at timestamptz,
  add column if not exists next_milestone_at date,
  add column if not exists source_acquisition text;

-- Index utiles pour filtres/tri
create index if not exists idx_clients_name on public.clients using gin (to_tsvector('simple', coalesce(name, '')));
create index if not exists idx_clients_status on public.clients(status);
create index if not exists idx_clients_segment on public.clients(segment);
create index if not exists idx_clients_am on public.clients(account_manager_id);
create index if not exists idx_clients_created_by on public.clients(created_by);
create index if not exists idx_clients_last_activity on public.clients(last_activity_at);
create index if not exists idx_clients_health on public.clients(health_score desc);

-- 3) Contacts client
create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_contacts enable row level security;

-- RLS: accès si on a accès au client (via created_by)
create policy if not exists client_contacts_select_own
  on public.client_contacts for select using (
    exists (
      select 1 from public.clients c
      where c.id = client_contacts.client_id
        and c.created_by = auth.uid()
    )
  );

create policy if not exists client_contacts_insert_own
  on public.client_contacts for insert with check (
    exists (
      select 1 from public.clients c
      where c.id = client_contacts.client_id
        and c.created_by = auth.uid()
    )
  );

create policy if not exists client_contacts_update_own
  on public.client_contacts for update using (
    exists (
      select 1 from public.clients c
      where c.id = client_contacts.client_id
        and c.created_by = auth.uid()
    )
  );

create policy if not exists client_contacts_delete_own
  on public.client_contacts for delete using (
    exists (
      select 1 from public.clients c
      where c.id = client_contacts.client_id
        and c.created_by = auth.uid()
    )
  );

-- 4) Jalons/Milestones
create table if not exists public.client_milestones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  due_date date not null,
  type text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_milestones enable row level security;

create policy if not exists client_milestones_select_own
  on public.client_milestones for select using (
    exists (
      select 1 from public.clients c
      where c.id = client_milestones.client_id
        and c.created_by = auth.uid()
    )
  );
create policy if not exists client_milestones_insert_own
  on public.client_milestones for insert with check (
    exists (
      select 1 from public.clients c
      where c.id = client_milestones.client_id
        and c.created_by = auth.uid()
    )
  );
create policy if not exists client_milestones_update_own
  on public.client_milestones for update using (
    exists (
      select 1 from public.clients c
      where c.id = client_milestones.client_id
        and c.created_by = auth.uid()
    )
  );
create policy if not exists client_milestones_delete_own
  on public.client_milestones for delete using (
    exists (
      select 1 from public.clients c
      where c.id = client_milestones.client_id
        and c.created_by = auth.uid()
    )
  );

-- 5) Vues sauvegardées (par utilisateur)
create table if not exists public.client_saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  params jsonb not null, -- filtres/tri/sélection colonnes
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.client_saved_views enable row level security;

create policy if not exists client_saved_views_select_own
  on public.client_saved_views for select using (user_id = auth.uid());
create policy if not exists client_saved_views_insert_own
  on public.client_saved_views for insert with check (user_id = auth.uid());
create policy if not exists client_saved_views_update_own
  on public.client_saved_views for update using (user_id = auth.uid());
create policy if not exists client_saved_views_delete_own
  on public.client_saved_views for delete using (user_id = auth.uid());

-- 6) Trigger updated_at sur nouvelles tables
create trigger set_updated_at_client_contacts
  before update on public.client_contacts
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at_client_milestones
  before update on public.client_milestones
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at_client_saved_views
  before update on public.client_saved_views
  for each row execute function public.tg_set_updated_at();

-- 7) Vue: utilisation du quota (mois courant)
create or replace view public.client_utilization_current_month as
select
  c.id as client_id,
  c.name,
  c.monthly_quota,
  coalesce(
    count(v.id) filter (
      where v.status = 'published'
        and v.archived_at is null
        and date_trunc('month', v.published_at) = date_trunc('month', now())
    ), 0
  )::int as published_count,
  case
    when c.monthly_quota > 0 then round(100 * coalesce(
      count(v.id) filter (
        where v.status = 'published'
          and v.archived_at is null
          and date_trunc('month', v.published_at) = date_trunc('month', now())
      ), 0
    )::numeric / c.monthly_quota, 0)::int
    else 0
  end as utilization_percent
from public.clients c
left join public.videos v on v.client_id = c.id
group by c.id, c.name, c.monthly_quota;

-- 8) Trigger: mise à jour de last_activity_at à chaque vidéo
create or replace function public.tg_update_client_last_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_id is not null then
    update public.clients
      set last_activity_at = greatest(
            coalesce(last_activity_at, '1970-01-01'::timestamptz),
            coalesce(new.published_at, new.created_at, now())
          ),
          updated_at = now()
    where id = new.client_id;
  end if;
  return new;
end;
$$;

-- index pour agrégations vidéos
create index if not exists idx_videos_client_published_at on public.videos(client_id, published_at);

drop trigger if exists tg_update_client_last_activity on public.videos;
create trigger tg_update_client_last_activity
  after insert or update of published_at, status on public.videos
  for each row execute function public.tg_update_client_last_activity();
