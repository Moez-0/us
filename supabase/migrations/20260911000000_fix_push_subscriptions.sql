-- Keep push subscriptions compatible with the current fixed partner identities.
alter table if exists public.push_subscriptions
  add column if not exists user_name text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'user_id'
  ) then
    execute $sql$
      update public.push_subscriptions subscriptions
      set user_name = members.name
      from public.members members
      where subscriptions.user_name is null
        and subscriptions.user_id::text = members.user_id::text
    $sql$;
  end if;
end $$;

alter table public.push_subscriptions
  alter column user_name set not null;

drop policy if exists "Members can manage their push subscriptions" on public.push_subscriptions;
drop policy if exists "push_subscriptions_authenticated" on public.push_subscriptions;
create policy "push_subscriptions_authenticated"
  on public.push_subscriptions for all to authenticated
  using (true) with check (true);

create unique index if not exists push_subscriptions_endpoint_idx
  on public.push_subscriptions(endpoint);