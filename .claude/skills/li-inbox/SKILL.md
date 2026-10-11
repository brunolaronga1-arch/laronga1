---
name: li-inbox
description: >-
  Faz a triagem da caixa de entrada do LinkedIn - separa pedidos de conexão e
  DMs em leads, recrutadores, pares e spam, e escreve as respostas que valem a
  pena. Use quando o usuário disser "minha caixa de entrada tá uma bagunça",
  "faz a triagem das minhas DMs", "devo responder isso?", colar um lote de
  mensagens do LinkedIn, ou estiver afogado em pedidos de conexão.
---

# li-inbox

A maioria das caixas de entrada do LinkedIn é 80% ruído, e o custo desse
ruído é que os 20% ficam uma semana sem resposta. Esta skill separa os dois
e escreve só o que vale a pena escrever.

Escreva as respostas em **português do Brasil**, ou no idioma de quem
mandou a mensagem.

## Entrada

O usuário cola as mensagens. Prints servem. Não entre na conta dele nem leia
a caixa de entrada com ferramenta de navegador.

## Separe em cinco

| grupo | sinal | ação |
| --- | --- | --- |
| **LEAD** | descreve um problema que o usuário resolve, ou pergunta sobre trabalhar junto | responder hoje, resposta completa |
| **RECRUTADOR** | uma vaga, uma empresa, uma faixa salarial | responder se a vaga é real, uma linha se não for |
| **PAR** | alguém da mesma área com algo a dizer | responder nesta semana, de forma humana |
| **PEDIDO** | quer conselho, tempo, uma apresentação, um favor | responder se for barato e específico, recusar com clareza se não |
| **SPAM** | propaganda de agência, sequência de prospecção, cripto, "pergunta rápida" sem pergunta | arquivar, sem resposta |

Mostre as contagens primeiro. Ver "3 leads, 2 recrutadores, 41 spam" já é a
maior parte do valor.

## Detectando uma sequência

Prospecção automática tem uma forma: um convite sem nada específico, uma
mensagem que chega minutos depois do aceite, "pergunta rápida", "vi que você
atua com {setor}", link de agenda na primeira mensagem, e depois um "só
passando aqui" exatamente quatro dias depois. Quando ver isso, marque como
SPAM e diga qual sinal entregou. O usuário não deve resposta a um script.

## Respostas

- **LEAD** - responda à pergunta da mensagem, por completo, de graça. Se
  houver encaixe, a oferta é uma frase no fim. Se não houver, diga e indique
  algum lugar útil. Os dois resultados são bons.
- **RECRUTADOR** - se a vaga é interessante de verdade, pergunte as três
  coisas que a mensagem não disse: faixa salarial, nível e se é presencial,
  híbrido ou remoto (e regime: CLT ou PJ). Se não for, uma linha: não estou
  procurando, posso indicar alguém, e indique de verdade.
- **PEDIDO** - se custa menos de dez minutos e é específico, faça. Se for
  "posso tomar um café pra trocar uma ideia", recuse numa frase gentil e dê a
  única resposta que você daria no café. É o jeito educado, e também o mais
  útil.
- **RECUSAS** são curtas, gentis e definitivas. Nada de "vamos conversar no
  segundo semestre" se não vai ter segundo semestre.

## Saída

Agrupada por grupo, contagens primeiro, rascunhos só para os grupos que
recebem resposta, cada um humanizado. Depois a trava: quem envia é o usuário.

```
CAIXA DE ENTRADA  ·  52 itens  ·  3 LEAD, 2 RECRUTADOR, 4 PAR, 2 PEDIDO, 41 SPAM

SPAM  (41) - arquivar. 38 são a mesma sequência: convite sem nada específico,
"pergunta rápida" 4 minutos depois do aceite, link de agenda na primeira mensagem.
```
