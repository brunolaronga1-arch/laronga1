-- Tabela de leads da landing page da Larong (Lovable Cloud / Supabase).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  empresa_origem text not null default 'Larong',
  nome text not null,
  whatsapp text not null,
  perfil text not null,
  tem_projeto_luminotecnico text not null,
  previsao_obra text,
  mensagem text,
  consentimento_lgpd boolean not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  pagina_origem text,
  referrer text,
  user_agent text,
  constraint leads_consentimento_obrigatorio check (consentimento_lgpd = true),
  constraint leads_nome_tamanho check (char_length(nome) between 2 and 120),
  constraint leads_whatsapp_tamanho check (char_length(whatsapp) between 10 and 20),
  constraint leads_mensagem_tamanho check (mensagem is null or char_length(mensagem) <= 2000)
);

alter table public.leads enable row level security;

-- O site (chave pública) só pode inserir. Leitura apenas pelo painel / service role.
drop policy if exists "Visitantes podem enviar leads" on public.leads;
create policy "Visitantes podem enviar leads"
  on public.leads for insert
  to anon, authenticated
  with check (consentimento_lgpd = true);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
