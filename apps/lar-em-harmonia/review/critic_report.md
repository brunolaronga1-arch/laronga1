# Etapa 7 — Revisão crítica

**Alvo:** `spec.md` (1–96) · Padrão: feature-spec-standard

| Revisor | Status |
| --- | --- |
| `egm-design` | concluído |
| `egm-structural` | concluído |
| `egm-style` | concluído |

## 🔴 Blocker (pelo padrão de spec)
1. **Faltam "Alternativas consideradas" e "Riscos e mitigações"** (design + structural). Só a L63 (PWA vs lojas) diz o que foi descartado e por quê. Sem alternativas para SMS/link mágico, convite, cron de 5 min, Firebase, três estados. Riscos estão espalhados nas Pendências. → Tabela "Alternativa → por que descartada" e seção "Riscos e limites".

## 🟡 Major
2. **Faltam Problema, Não-objetivos e Arquitetura** (structural, design). "Objetivo" descreve a solução. Não-objetivos implícitos: várias casas, lojas, SMS, WhatsApp. → Seções curtas; arquitetura em linguagem simples (registro → banco com regras → tempo real; cron → avisos → push).
3. **Bloqueado continua recebendo push** (design; já na etapa 5). `reminders.ts:21`, `:42+`; `members.functions.ts:136`; tokens não apagados.
4. **"Último pai ou mãe ativo" tem condição de corrida** (design). `members.functions.ts:129` conta admins e depois bloqueia, sem transação. Dois pais bloqueando um ao outro ao mesmo tempo → casa sem admin, e o cadastro do primeiro admin já está fechado (`:64`). → Regra atômica no banco + procedimento de emergência.
5. **Revogar é permanente e prende o celular** (design). `members.functions.ts:125-126`; `phone_e164` único (`0005:14`). A mesma babá recontratada não volta com o mesmo número. → Dizer no spec; decidir se libera o número; avisar na tela antes de revogar.
6. **Avisos sem alerta de falha** (design). Precisão de até 5 min; cron parado ninguém percebe; notificação marcada `pushed_at` mesmo sem aparelho (`reminders.ts:56-59`), então quem ativa push depois não recebe; iPhone exige app instalado na tela inicial. → Registrar limites; mostrar "último envio às HH:MM" / "Fulana sem avisos".
7. **Afirmações no presente sobre o que não foi testado** (style). L35, 45, 51, 53 vs L74, 89. → Marcar implementado / testado / pendente.
8. **Nomes inconsistentes** (style, structural). Produto com 3 nomes; papéis como "Pai e Mãe"/"pais"/"Administradores"; L52 "Nenhum pai" pode excluir a Mãe. → Glossário e termo único.
9. **Bruno e Nala não apresentados** (style; idem etapa 6).
10. **Regra da babá incompleta** (style). L46 omite o diário, que L14/L25 dão a ela. → "tarefas, diário e estoque da Isabela".
11. **Limite de tentativas do convite sem número** (style). L49 vs L50.

## 🟢 Nit
- Pendências/status misturados com a spec (L3, 71–96) → apêndice ou arquivo de status; deixar só "Questões em aberto".
- Celular do convite "obrigatório" só na função (`members.functions.ts:207-213`); banco e `auth-rules.ts:115` aceitam vazio.
- Bloqueio de login por celular permite trancar a equipe; janela real é "5 erros em 15 min desde o último acerto".
- "Acesso desativado": confirmar em teste a ordem banimento/senha no serviço de auth.
- Fuso de São Paulo não declarado; diário da bebê (remédio, saúde) sem seção de privacidade (retenção, exclusão); todos leem todos os perfis, inclusive celulares (`0000:42`).
- `notify_admins_pending` permite desligar aviso aos pais — não está no spec.
- Repetições entre Funcionalidades e Decisões (24/66, 31/64, 39/61, 40/62, 32/67); mover "Não deu conta como registro" para L31.
- Jargão: "card", "Plano de QA", "logs". Frases vagas: "quase sem digitar", "na hora", "levemente quente".

**Confere com o código:** convite de uso único com hash, 7 dias, perfil travado, limite de tentativas; recuperação só para pais confirmados; senha provisória mostrada uma vez; não bloquear a si mesmo; apagar registro em 15 min; bloqueio checado em `is_member`/`has_role`/`my_kind`.
