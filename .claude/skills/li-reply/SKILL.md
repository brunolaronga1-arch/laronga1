---
name: li-reply
description: >-
  Cuida das respostas aos comentários nos posts do próprio usuário no LinkedIn
  - escreve respostas para cada comentário, ordenadas pelo que vale a pena
  responder. Use quando o usuário colar os comentários do post dele, disser
  "responde esses", "cuida dos meus comentários", "alguém comentou X no meu
  post", ou estiver lidando com um crítico ou um lead nos comentários.
---

# li-reply

A conversa embaixo do seu próprio post é onde o alcance é decidido de
verdade. Cada resposta é um novo evento de engajamento no post, e a primeira
hora de respostas faz a maior parte do trabalho. Mas o valor não é igual
entre os comentários, então esta skill classifica antes de escrever.

Responda em **português do Brasil**, ou no idioma de quem comentou.

## Entrada

O usuário cola os comentários, de preferência com nomes e cargos. Prints
servem. Não raspe a conversa com ferramenta de navegador.

## Triagem primeiro

Classifique cada comentário num destes cinco grupos e diga a contagem:

| grupo | o que é | o que recebe |
| --- | --- | --- |
| **LEAD** | alguém descrevendo o problema que você resolve | uma resposta de verdade + uma porta aberta, sem pressão |
| **CONTEÚDO** | traz dado, discorda, estende | a resposta mais longa da conversa |
| **PAR** | um nome ao lado do qual vale ser visto | uma resposta que dá algo a ele |
| **APOIO** | "ótimo post", 🔥, uma marcação | uma curtida e no máximo 3 a 8 palavras |
| **RUÍDO** | propaganda, spam, má-fé | nada, ou uma linha e pronto |

Depois escreva nessa ordem, e pare quando o valor acabar.

## Como responder

- **Responda à pergunta de verdade.** Se perguntaram como, explique como, na
  resposta. Não mande para a DM ouvir uma resposta que podia estar ali.
- **Use o nome da pessoa uma vez**, no começo, e nunca com exclamação.
- **Acompanhe o tamanho.** Comentário de duas linhas não ganha resposta de
  seis.
- **Para um crítico:** reconheça primeiro a parte verdadeira, com as palavras
  dele, depois mantenha a posição no que você acredita. Nunca apague, nunca
  fique na defensiva, nunca responda duas vezes na mesma conversa.
- **Para um lead:** responda por completo em público. A porta aberta é uma
  frase no fim, e é uma oferta de ajuda, não uma venda. Valor em público é o
  que faz a próxima pessoa te chamar na DM.
- **Para propaganda nos seus comentários:** ignore. Responder dá alcance.

## Saída

Um bloco, agrupado por grupo, cada resposta pronta para copiar e já
humanizada:

```
RESPOSTAS  ·  17 comentários  ·  1 LEAD, 3 CONTEÚDO, 4 PAR, 8 APOIO, 1 RUÍDO

LEAD
@Mariana Costa - "a gente tem o mesmo problema com propostas"
> O que resolveu pra gente foi tirar a tabela de preços do documento e mandar
> como uma página separada. Cortou uma rodada inteira de revisão. Se ajudar,
> te mando o modelo.

CONTEÚDO
@Rafael Lima - discorda da frequência
> Justo, e 4 vezes por semana só funcionou porque eu já tinha 8 meses de posts
> antes. Começando do zero, eu faria o que você disse.

APOIO  (curta todos, responda os três primeiros)
@... "Muito bom" -> Valeu, Daniel.
...

RUÍDO  (1)
Ignorado: propaganda de agência. Responder dá alcance.
```

Depois, a trava: **nada é publicado até o usuário dizer sim.** Ele mesmo
cola as respostas.
