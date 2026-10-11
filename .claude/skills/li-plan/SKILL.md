---
name: li-plan
description: >-
  Monta a semana no LinkedIn - o que postar, quando postar e com quem
  interagir. Use quando o usuário disser "planeja minha semana", "o que eu
  posto?", "calendário de conteúdo", "não tenho sobre o que postar", ou
  quiser uma agenda de posts e uma lista de engajamento.
---

# li-plan

A sala de controle. Todo o resto do pacote executa; esta skill decide o que
é executado. Rode uma vez por semana, sempre no mesmo dia.

Escreva o plano em **português do Brasil**.

## Entrada

Se `.claude/linkedin/voice.md` e `.claude/linkedin/log.md` existirem (ou as
versões em `~/.claude/linkedin/`), leia: o plano não deve repetir um tema
das últimas duas semanas. Se não existirem, peça quatro coisas e anote:

1. O que o usuário vende, e para quem.
2. Os três ou quatro temas pelos quais ele quer ser conhecido.
3. O que aconteceu de verdade nesta semana: uma conversa com cliente, um
   número, um erro, algo que ele construiu, uma discussão que teve. É daí que
   os posts saem.
4. De dez a vinte pessoas ou empresas para as quais vale a pena ser visto.

## O que postar

Quatro posts por semana ganham de sete. Constância é piso, não meta, e o
quinto post da semana quase sempre é o fraco que derruba a média.

Misture ao longo da semana, nunca dois do mesmo tipo seguidos:

| tipo | frequência | função |
| --- | --- | --- |
| **Prova** | 1 por semana | algo que aconteceu, com um número |
| **Opinião** | 1 por semana | uma posição que pode te fazer perder seguidores |
| **Ensino** | 1 por semana | uma coisa que o leitor pode fazer hoje |
| **História** | 1 a cada 15 dias | uma cena com diálogo e um custo |
| **Oferta** | 1 a cada 15 dias | o que você vende, dito com clareza, sem pedir desculpa |

Para cada espaço, dê: o tema, o ângulo específico tirado do que aconteceu na
semana e o número da fórmula de gancho de `li-post/hooks.json` que combina.
Não é um assunto, é um ângulo. "IA" não é plano. "A proposta que perdemos
porque o rascunho feito por IA tinha um travessão" é um post.

## Quando postar

Poste quando o público do usuário está na frente do computador. Para um
público B2B no Brasil, de terça a quinta, entre 7h30 e 9h30 no horário de
Brasília, é o padrão que funciona, com segunda à tarde e sexta de manhã como
segunda opção. Horário de almoço (12h às 13h30) também costuma render no
Brasil. Fim de semana é para história pessoal ou nada.

Mas diga com clareza: **o dia e a hora importam muito menos do que a
primeira linha ser boa.** Se o usuário está otimizando horário antes de os
ganchos funcionarem, está polindo a coisa errada, e você deve dizer isso.

Use o fuso do público, não o do usuário, se forem diferentes.

## Com quem interagir

Monte uma lista de 10, dividida em três:

- **5 de alcance** - pessoas com o público que o usuário quer, em cujos posts
  ele consegue acrescentar algo de verdade. Comente antes de o post ter 20
  comentários, senão ninguém vê.
- **3 pares** - mesmo nível, mesma área. É o grupo que retribui.
- **2 compradores** - pessoas que de fato poderiam comprar. Comente nos posts
  delas por semanas antes de qualquer DM, e nunca venda num comentário.

20 minutos por dia, antes de postar, não depois. Os comentários nos posts
dos outros é que fazem o post do usuário pegar.

## Saída

```
SEMANA DE 8 DE SETEMBRO

SEG  só engajamento  (20 min, lista abaixo)
TER  8h15  PROVA     #17 Âncora de Tempo  - a proposta que caiu de 5h para 20 min
QUA  só engajamento
QUI  8h00  OPINIÃO   #1  Contra a Corrente - por que acabamos com a call de diagnóstico
SEX  8h30  ENSINO    #21 Valor Direto      - o e-mail de 4 linhas que reabre negociação, de graça
SÁB  -
DOM  16h00 HISTÓRIA  #9  Abertura em Cena   - o e-mail "vamos fechar com alguém mais barato"

ENGAJAMENTO  (5 alcance / 3 pares / 2 compradores)
  ...

Diga "escreve terça" e eu faço o rascunho.
```

Grave o plano em `.claude/linkedin/plan.md` para as outras skills lerem.
Nada é agendado nem publicado em lugar nenhum: é um plano, e quem executa é
o usuário.
