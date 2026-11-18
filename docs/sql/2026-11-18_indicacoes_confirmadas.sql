-- Indicações confirmadas pela entrada no grupo VIP
-- Aplicado no Lovable Cloud em 18/11/2026. Idempotente.

-- 1) Normaliza telefone BR: só dígitos, com 55 e com o 9º dígito em celulares
create or replace function public.normalize_br_phone(_raw text)
returns text language plpgsql immutable set search_path = public as $$
declare d text;
begin
  d := regexp_replace(coalesce(_raw, ''), '\D', '', 'g');
  if d = '' then return null; end if;
  if length(d) in (10, 11) then d := '55' || d; end if;
  -- 55 + DDD + 8 dígitos começando com 6-9 => celular sem o 9
  if length(d) = 12 and left(d, 2) = '55' and substr(d, 5, 1) in ('6','7','8','9') then
    d := left(d, 4) || '9' || substr(d, 5);
  end if;
  return d;
end $$;

-- 2) Tabela de indicações
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  whatsapp text not null unique,
  gender text not null default '?' check (gender in ('F','M','?')),
  status text not null default 'pending'
    check (status in ('pending','joined','review','rejected','left')),
  reject_reason text,
  created_at timestamptz not null default now(),
  joined_at timestamptz,
  left_at timestamptz
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

alter table public.referrals enable row level security;

drop policy if exists "Referrer reads own referrals" on public.referrals;
create policy "Referrer reads own referrals" on public.referrals
  for select to authenticated using (auth.uid() = referrer_id);

drop policy if exists "Admins read referrals" on public.referrals;
create policy "Admins read referrals" on public.referrals
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update referrals" on public.referrals;
create policy "Admins update referrals" on public.referrals
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete referrals" on public.referrals;
create policy "Admins delete referrals" on public.referrals
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 3) referral_count do perfil = indicações confirmadas (entraram no grupo)
create or replace function public.sync_referral_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  rid := coalesce(new.referrer_id, old.referrer_id);
  update public.profiles
     set referral_count = (select count(*) from public.referrals r
                            where r.referrer_id = rid and r.status = 'joined')
   where id = rid;
  return null;
end $$;

drop trigger if exists referrals_sync_count on public.referrals;
create trigger referrals_sync_count
  after insert or update or delete on public.referrals
  for each row execute function public.sync_referral_count();

-- 4) Cadastro da amiga indicada (chamado pela página pública)
create or replace function public.register_referral(
  _referral_code text, _name text, _whatsapp text, _gender text default '?'
) returns json language plpgsql security definer set search_path = public as $$
declare
  ref public.profiles%rowtype;
  phone text := public.normalize_br_phone(_whatsapp);
  g text := case when _gender in ('F','M') then _gender else '?' end;
  st text := 'pending';
  reason text := null;
begin
  if coalesce(trim(_name), '') = '' or phone is null or length(phone) < 12 then
    return json_build_object('ok', false, 'error', 'Preencha nome e WhatsApp válidos.');
  end if;

  select * into ref from public.profiles where referral_code = upper(trim(_referral_code));
  if not found then
    return json_build_object('ok', false, 'error', 'Link de indicação inválido.');
  end if;

  if public.normalize_br_phone(ref.whatsapp) = phone then
    return json_build_object('ok', false, 'error', 'Não é possível indicar o próprio número.');
  end if;

  if exists (select 1 from public.referrals where whatsapp = phone) then
    return json_build_object('ok', false, 'error', 'Este WhatsApp já foi indicado.', 'already', true);
  end if;

  if exists (select 1 from public.profiles where public.normalize_br_phone(whatsapp) = phone) then
    st := 'rejected'; reason := 'Já participa do Indique e Ganhe';
  elsif g = 'M' then
    st := 'rejected'; reason := 'Nome masculino';
  end if;

  -- limite anti-abuso: 30 cadastros por indicadora por dia
  if (select count(*) from public.referrals
       where referrer_id = ref.id and created_at > now() - interval '1 day') >= 30 then
    return json_build_object('ok', false, 'error', 'Limite diário de indicações atingido.');
  end if;

  insert into public.referrals (referrer_id, name, whatsapp, gender, status, reject_reason)
  values (ref.id, trim(_name), phone, g, st, reason);

  return json_build_object('ok', true, 'status', st);
end $$;

grant execute on function public.register_referral(text, text, text, text) to anon, authenticated;

-- 5) Entrada / saída do grupo (chamado pelo webhook com service role, ou pelo admin)
create or replace function public.mark_group_event(_phone text, _event text default 'join')
returns json language plpgsql security definer set search_path = public as $$
declare
  phone text := public.normalize_br_phone(_phone);
  r public.referrals%rowtype;
begin
  if auth.role() <> 'service_role' and not public.has_role(auth.uid(), 'admin') then
    raise exception 'not allowed';
  end if;

  select * into r from public.referrals where whatsapp = phone;
  if not found then
    return json_build_object('ok', true, 'matched', false);
  end if;

  if _event = 'join' then
    if r.status in ('pending', 'left') then
      update public.referrals
         set status = case when r.gender = 'F' then 'joined' else 'review' end,
             joined_at = now(), left_at = null
       where id = r.id;
    end if;
  elsif _event = 'leave' then
    -- saiu em até 7 dias da entrada: a indicação deixa de contar
    if r.status = 'joined' and r.joined_at > now() - interval '7 days' then
      update public.referrals set status = 'left', left_at = now() where id = r.id;
    end if;
  end if;

  return json_build_object('ok', true, 'matched', true);
end $$;

grant execute on function public.mark_group_event(text, text) to authenticated, service_role;

-- 6) Resumo da cliente logada
create or replace function public.get_my_referral_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total',   count(*),
    'joined',  count(*) filter (where status = 'joined'),
    'pending', count(*) filter (where status in ('pending','review')),
    'rejected',count(*) filter (where status in ('rejected','left'))
  ) from public.referrals where referrer_id = auth.uid();
$$;
grant execute on function public.get_my_referral_stats() to authenticated;

-- 7) Presentes: cupom só aparece para quem desbloqueou; tabela crua só para admin
create or replace function public.get_my_rewards()
returns table (id uuid, milestone int, title text, description text, coupon_code text, unlocked boolean)
language sql stable security definer set search_path = public as $$
  select rw.id, rw.milestone, rw.title, rw.description,
         case when p.id is not null and coalesce(p.referral_count, 0) >= rw.milestone then rw.coupon_code end,
         p.id is not null and coalesce(p.referral_count, 0) >= rw.milestone
    from public.rewards rw
    left join public.profiles p on p.id = auth.uid()
   where coalesce(rw.is_active, true)
   order by rw.sort_order, rw.milestone;
$$;
grant execute on function public.get_my_rewards() to anon, authenticated;

drop policy if exists "Anyone can read rewards" on public.rewards;
drop policy if exists "Admins can read rewards" on public.rewards;
create policy "Admins can read rewards" on public.rewards
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 8) Token do webhook em tabela privada (só admin lê)
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;
drop policy if exists "Admins read secrets" on public.app_secrets;
create policy "Admins read secrets" on public.app_secrets
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
insert into public.app_secrets (key, value)
values ('webhook_token', encode(extensions.gen_random_bytes(18), 'hex'))
on conflict (key) do nothing;

-- 9) Ranking completo (só admin)
create or replace function public.admin_ranking()
returns table (id uuid, name text, whatsapp text, joined bigint, pending bigint, rejected bigint)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.whatsapp,
         count(r.*) filter (where r.status = 'joined'),
         count(r.*) filter (where r.status in ('pending','review')),
         count(r.*) filter (where r.status in ('rejected','left'))
    from public.profiles p
    left join public.referrals r on r.referrer_id = p.id
   where public.has_role(auth.uid(), 'admin')
   group by p.id
   order by 4 desc, 5 desc;
$$;
grant execute on function public.admin_ranking() to authenticated;
