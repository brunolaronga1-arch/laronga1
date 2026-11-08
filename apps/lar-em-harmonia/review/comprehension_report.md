# Etapa 6 — Teste de compreensão

**Alvo:** `spec.md` (1–96), lido isoladamente · Revisor `egm-comprehension`: concluído

## What this proposes
App de celular para organizar a casa e os cuidados da bebê Isabela (8 meses), feito no Lovable ("Little Nest Household Planner"). Babá e diarista registram o dia com toques (tarefas, diário, itens faltantes, estoque); os pais planejam agenda, avisos, cardápio, receitas, brincadeiras e estoque, gerenciam pessoas e acompanham em tempo real. Acesso por celular e senha; entrada por convite via WhatsApp ou senha provisória; permissões no servidor; app instalável pelo navegador, só leitura sem internet. Termina com decisões e pendências, quase todas dependendo do Bruno.

## How the existing system works, per this document
Há um projeto no Lovable com essas funções, mas a versão atual não foi publicada; o texto sugere uma versão publicada mais antiga ("login novo… só funcionam no app publicado"). Avisos hoje só no "sino" (falta Firebase). E-mails saem em inglês de no-reply@auth.lovable.cloud. O e-mail de recuperação do Bruno foi cadastrado à mão. **Incompleto:** o documento não diz o que a versão publicada antiga faz, quem a usa nem como migrar.

## Achados
| # | Sev. | Linhas | Lacuna → recomendação |
|---|---|---|---|
| 1 | Major | 69,74,78,81,90,95 | "Bruno" nunca é apresentado → dizer na tabela de usuários que é o Pai/primeiro admin/dono do projeto e por que sua conta foi tratada à mão |
| 2 | Major | 15,33,46 | "Nala" não é definida (é área de estoque e de permissão) → ex.: "Nala (cachorra da família)" |
| 3 | Major | 3,74 | Versão publicada antiga e migração obscuras → seção "Estado atual em produção" |
| 4 | Major | 50,84 | "Mensagem genérica" vs "Acesso desativado" → registrar a exceção na L50 |
| 5 | Major | 67,83 | "Nada preenchido automaticamente" vs buscar título de vídeo (YouTube já busca?) → esclarecer |
| 6 | Major | 31,79,96 | Canal dos avisos (sino vs push) e papel do Firebase não descritos → descrever na L31 |
| 7 | Major | 34,51 | Bloquear vs revogar: reversibilidade e destino dos dados → uma linha por ação |
| 8 | Major | 65 | "Atrasada" não definida → regra de quando a tarefa fica atrasada |
| 9 | Major | 26 | "Brincadeira sugerida" por quem? Conflita com curadoria (L67) → origem e prioridade |
| 10 | Nit | 1,3 | Três nomes do mesmo app (Planner da Isabela, Little Nest, lar-em-harmonia) |
| 11 | Nit | 3,79,82 | Lovable e backend sem definição |
| 12 | Nit | 76 | Menu "Mais" e "visual novo" sem contexto |
| 13 | Nit | 24,33 | "Área" usada antes de ser definida |
| 14 | Nit | 15,30,32,40,49 | Vagos: efeito dos dias da diarista, histórico de quê, como cardápio vira tarefa, nível de sujeira, favoritos de quem, limite de tentativas do convite |
| 15 | Nit | 86 | "Plano de QA" citado sem link |
