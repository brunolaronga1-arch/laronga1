# Revisão EGM consolidada — Planner da Isabela

**Alvo:** `apps/lar-em-harmonia/spec.md` (linhas 1–96) · **Modo:** relatório consolidado · **Data:** 2026-11-08
**Contexto dos revisores:** cópia parcial do código Lovable (commit `6c38408`): AGENTS.md, migrações, `auth-rules.ts`, `auth.functions.ts`, `members.functions.ts`, `reminders.ts`. Telas e demais libs não foram vistas.

| Etapa | Revisores | Relatório |
| --- | --- | --- |
| 5 Zoom Out inicial | zoom-out, inventive-catalyst | `zoom_out_report.md` |
| 6 Compreensão | comprehension | `comprehension_report.md` |
| 7 Crítica | design, structural, style | `critic_report.md` |
| 8 Zoom Out intermediário | zoom-out | `intermediate_zoom_out_report.md` |
| 9 Prontidão p/ implementar | — | não se aplica (spec sem plano de implementação) |

Prioridades abaixo já aplicam o julgamento de altitude da etapa 8 (casa única, 4 usuários).

## 🔴 Bloqueante — antes de publicar
| ID | Ação | Origem |
| --- | --- | --- |
| B1 | **Bloquear/revogar deve cortar os avisos.** Hoje o job (`reminders.ts:21`) filtra só `active` e o trigger de estoque (`0000:311`) avisa todo admin; bloquear mantém `active=true` e os `push_tokens`. Pedir ao Lovable: apagar `push_tokens` ao bloquear/revogar e filtrar `blocked`/`revoked_at` no job e no trigger. | E5#1, E7#3, E8#2 |
| B2 | **Recuperação da Mãe convidada falha em silêncio.** `acceptInvite` grava o e-mail sem confirmar (`recovery_email_confirmed_at` fica nulo) e `requestRecovery` exige confirmação. Pedir ao Lovable para disparar a confirmação (`setRecoveryEmail`) no aceite do convite. | E5#3, E8#3 |
| B3 | **Ordem de publicação:** publicar → QA com contas de teste → apagar contas → convidar a Mãe → convidar a equipe. | E5#5, E8#C |

## 🟡 Importante — ajustes no texto do spec (antes de publicar)
| ID | Ação | Origem |
| --- | --- | --- |
| M1 | Apresentar **Bruno** (Pai, primeiro admin, dono e mantenedor do projeto) e **Nala** na tabela de usuários; definir as áreas (Isabela, Casa, Nala). | E6#1,2,13; E7#9 |
| M2 | Estoque: escrever **"vê tudo, edita só a sua área"** (é o que o banco faz: `0000:248`). | E5#2, E8#10 |
| M3 | Regra da babá (L46): incluir o **diário**. Trocar "Nenhum pai" por "Nenhum dos pais" (L52). | E7#8,10 |
| M4 | Senha provisória (L53): "ninguém vê a senha definitiva de outra pessoa; a provisória aparece uma vez e deve ser trocada no primeiro acesso". | E5#4, E8#4 |
| M5 | L41: o bloqueio de registros sem internet é **escolha consciente**. | E5#6, E8#5 |
| M6 | L50: citar a exceção "Acesso desativado" e decidir a pendência L84 depois de testar a ordem banimento/senha. | E5#7, E6#4, E7 |
| M7 | Bloquear vs revogar: bloquear é reversível; **revogar é definitivo e prende o celular** (`phone_e164` único) — para recontratar, use Bloquear. | E6#7, E7#5, E8#11 |
| M8 | Definir **"Atrasada"**, a origem da **brincadeira sugerida** e o **limite de tentativas** do convite (número). | E6#8,9; E7#11 |
| M9 | Avisos (L31): canais **sino** e **push**, push depende do Firebase, precisão de até 5 min, iPhone só com app instalado na tela inicial, pais podem desligar aviso de pendência (`notify_admins_pending`). | E6#6, E7#6, E8 |
| M10 | Bloco **"Não faz"** (várias casas, lojas, SMS, WhatsApp automático) e **"Limites conhecidos"** (≤ 8 linhas): custo mensal, mantenedor, onde ficam cópias dos dados, sem admin → restaurar pelo Lovable. | E7#1,2; E8#1,A,B |
| M11 | Esclarecer se existe **versão publicada antiga** e o que muda ao publicar (L3/L74). | E6#3 |
| M12 | Vídeos: dizer o que já é buscado automaticamente (YouTube?) para não contradizer L67. | E6#5 |

## 🟢 Depois / detalhes
- Não marcar `pushed_at` quando a pessoa não tem aparelho (`reminders.ts:56-58`), para que quem ativar o push depois receba os pendentes.
- Exportação manual periódica (CSV) do diário da Isabela.
- Domínio próprio para e-mails em português, só se incomodar (L82).
- Um nome só para o app; tirar jargão ("card", "logs"); remover repetições entre Funcionalidades e Decisões.
- Declarar o fuso de São Paulo e uma linha sobre dados de saúde ("só membros ativos leem").
- QA: incluir bloqueio com app aberto (avisos inclusos), leitura de estoque, primeiro cadastro.

## ⛔ Não fazer (exagero para uma casa — etapa 8)
Fila offline agora; link de redefinição no lugar da senha provisória; regras atômicas de primeiro/último admin no banco; painel de monitoramento de avisos; seção completa de privacidade/retenção; tabela de alternativas para cada decisão; seções de arquitetura/produção no spec; glossário e status linha a linha; espera progressiva no login; limpeza de enums/colunas antigas; buscar título de vídeo (L83); ambiente de staging.

## Matriz de rastreabilidade
| Achado bruto | → Ação |
| --- | --- |
| E5#1, E5-cat#1, E7-design#2 | B1 |
| E5#3 | B2 |
| E5-cat#4, E8#C | B3 |
| E6#1,2,13; E7-style#4 | M1 |
| E5#2; E8#10 | M2 |
| E7-style#3,6 | M3 |
| E5-cat#3; E8#4 | M4 |
| E5-cat#2; E8#5 | M5 |
| E5#7; E5-cat#7; E6#4; E7-design#7 | M6 |
| E6#7; E7-design#4; E8#11 | M7 |
| E6#8,9; E7-style#5 | M8 |
| E5-cat#5; E6#6; E7-design#5,9 | M9 |
| E7-structural#1,2,3,4; E7-design#1; E8#1,A,B | M10 |
| E6#3; E7-style#9 | M11 |
| E6#5 | M12 |
| E5#4,6; E5-cat#6,8; E7-design#6,8; E7-structural#5,6,7; E7-style#1,2,7,8 | Depois / Não fazer |
