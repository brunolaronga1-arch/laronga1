# Etapa 8 — Zoom Out intermediário

**Alvo:** `spec.md` (1–96) + relatórios das etapas 5–7 · Revisor `egm-zoom-out`: concluído

Julgamento de altitude: as etapas 5–7 somam ~50 recomendações, muitas pensadas para produto multi-cliente. Para uma casa com 4 usuários:

| Recomendação anterior | Veredito |
| --- | --- |
| Blocker "Alternativas + Riscos" (etapa 7) | Rebaixar para Nit. Só um bloco "Não faz" (várias casas, lojas, SMS, WhatsApp automático) e "Limites conhecidos" (≤ 8 linhas) |
| Bloqueado recebe push | **Manter.** Apagar `push_tokens` ao bloquear/revogar e filtrar `blocked`/`revoked_at` no job. Spec: "perde o acesso" = dados e avisos |
| Recuperação da Mãe convidada | **Manter.** Reaproveitar `setRecoveryEmail`; QA testa o pedido de recuperação |
| Link de redefinição no lugar da senha provisória | Não fazer. Mudar o texto da L53 (provisória aparece uma vez e precisa ser trocada) |
| Fila offline | Não fazer agora. Declarar na L41 que é escolha consciente |
| Regras atômicas primeiro/último admin | Não fazer. Uma linha: "sem admin → restaurar pelo Lovable" |
| Monitoramento dos avisos | Não construir. Depois: não marcar `pushed_at` sem aparelho (`reminders.ts:56-58`) |
| Seção de privacidade/retenção | Uma linha só |
| Glossário, status linha a linha, arquitetura, estado de produção | Não fazer. Uma linha "Bruno = Pai, dono do projeto", "Nala = cachorra" resolve 80% da etapa 6 |
| Estoque por área | Mudar o spec: "vê tudo, edita só a sua área" |
| Revogar prende o celular | Só avisar: "para recontratar, use Bloquear" |
| Espera progressiva no login, celular obrigatório no banco, limpar enums, título de vídeo, staging | Não fazer |

## Lacunas que nenhuma etapa viu
- **A. Sem cópia dos dados e sem saída do Lovable — Major.** Todo o histórico da Isabela fica num único projeto gerenciado. Dizer quem paga, qual plano e onde ficam cópias; uma exportação manual mensal (CSV do diário) basta.
- **B. Custo e manutenção — Major.** Spec justifica o PWA pelo custo das lojas, mas não diz custo de Lovable/banco/Firebase nem quem mantém (Bruno é usuário, admin e único mantenedor). Duas linhas.
- **C. Ordem de publicação — Major.** Publicar → QA com contas de teste → apagar → convidar a Mãe → convidar a equipe. Sem staging.
