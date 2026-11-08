# Etapa 5 — Zoom Out inicial

**Alvo:** `apps/lar-em-harmonia/spec.md` (linhas 1–96) · **Contexto:** AGENTS.md, migrações, auth/members/reminders

| Revisor | Status |
| --- | --- |
| `egm-zoom-out` | concluído |
| `egm-inventive-catalyst` | concluído |

Pré-requisito de contexto: **passa** nos dois. Objetivo e princípio ("equipe registra com toques; pais configuram") estão claros.

## Achados

### 1. Pessoa bloqueada continua recebendo avisos — Major (os dois revisores)
- Spec L51 promete perda de acesso "na hora". O RLS corta os dados, mas o job de avisos e o trigger de estoque usam service role e não checam bloqueio.
- `reminders.ts:21` filtra só `active`; bloquear (`members.functions.ts:133-139`) põe `blocked=true` e mantém `active=true`, papéis e `push_tokens`. `0000:311` avisa todo admin em `user_roles`, inclusive bloqueado. `reminders.ts:42-55` envia a qualquer `user_id` pendente.
- Cache offline (React Query em localStorage) também fica no aparelho do bloqueado.
- **Recomendação:** uma regra única de "membro válido" (`is_member`/`has_role`) usada também no job e no trigger; apagar `push_tokens` ao bloquear/revogar; dizer no spec o que "perde o acesso" cobre (dados, avisos, cache).

### 2. Leitura de estoque por área não é aplicada no servidor — Major
- Spec L24/L46 + L45 ("permissões no servidor"). `0000:248` e `:276`: qualquer membro lê `products` e `shopping_items`; só a edição é restrita (`can_update_area`).
- **Recomendação:** ou mudar o spec para "vê tudo, edita só a sua área", ou reaproveitar `can_update_area` na política de leitura.

### 3. E-mail de recuperação da Mãe convidada nunca é confirmado — Major (a confirmar nas telas)
- `acceptInvite` (`members.functions.ts:328-335`) grava o e-mail sem enviar link nem preencher `recovery_email_confirmed_at`; `requestRecovery` (`auth.functions.ts:64`) exige esse campo; `completeProfileDue` dispensa convidados (`auth-rules.ts:97-98`). Resultado: a recuperação da Mãe falha em silêncio.
- **Recomendação:** no fim de `acceptInvite`, reaproveitar `setRecoveryEmail`/`confirmRecoveryEmail`; o QA (L90) deve testar o pedido de recuperação, não só a chegada do e-mail.

### 4. Senha provisória contradiz "ninguém vê a senha de outra pessoa" — Major (catalyst)
- Spec L53 vs `members.functions.ts:104-108` e `:165-172`, que mostram a senha ao pai.
- **Recomendação:** "link de redefinição" para a equipe no mesmo modelo do convite (uso único, hash, celular travado), enviado por WhatsApp, com validade curta. Senha provisória vira plano B ou sai.

### 5. Testes críticos só depois de publicar, com a família — Major (catalyst)
- L74 + L86-92 + L95: o spec não ordena QA vs convites.
- **Recomendação:** publicar → QA com contas de teste → apagar contas → só então convidar (ou remix de staging no Lovable). Atenção: contas de teste deixam rastro em `member_audit`.

### 6. Sem internet a equipe não registra — Major consultivo (catalyst)
- L41 vs L7/L60. Diário é só-inserção, status é único por `(task_id, occ_date)`, pedido de item é insert simples: dá para ter uma fila local.
- **Recomendação:** fila offline para essas ações, ou declarar no spec que o bloqueio é escolha consciente e temporária. Efeitos: horários passariam a vir do aparelho (`now()` no trigger), regras de Desfazer/15 min.

### Nits
- **Casa única** não aparece no spec (só no AGENTS.md, `settings id=1`). Acrescentar em Decisões.
- **Pendências YAGNI:** buscar título de vídeo (L83) — não fazer; domínio próprio (L82) — depois, se incomodar; categorias Roupas/Cozinha (L81) — `category` é texto livre, provavelmente é só cadastro.
- **Banco guarda opções fora do escopo:** canal `whatsapp`, estoque `quase_acabou` (4º estado com prioridade 2 que ninguém da equipe marca), `em_andamento`, colunas `reminder_before`/`pending_after` obsoletas. Registrar no spec; limpeza só via Lovable.
- **"Acesso desativado" (L84):** só aparece após senha certa (`auth.functions.ts:39-42`), exceto ramo "banned" (`:33-34`), que depende da ordem do serviço de auth. Decidir e citar a exceção na L50.
- **Bloqueio por celular permite trancar outra pessoa:** quem souber o número da babá pode errar 5× e trancá-la 15 min, repetidamente (`auth.functions.ts:21-23`). Espera progressiva ou desbloqueio pelos pais.
- **Primeiro admin não é atômico:** `members.functions.ts:63-67` — dois envios simultâneos criam dois admins. Risco baixo; registrar ou testar.
- **Tolerância dos avisos:** cron de 5 min → aviso pode chegar até ~5 min fora do horário. Declarar no spec.
- **QA faltando:** bloqueio/revogação com app aberto (incl. avisos e offline), leitura de estoque por área, primeiro cadastro.
