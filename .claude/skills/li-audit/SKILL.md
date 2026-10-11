---
name: li-audit
description: >-
  Análise do que o usuário já publicou - quais posts funcionaram de verdade,
  por quê, e o que parar de fazer. Use quando o usuário colar as métricas do
  LinkedIn ou posts antigos e perguntar "o que está funcionando?", "por que
  esse post flopou?", "lê minhas métricas", "audita meu conteúdo", ou quiser
  saber onde apostar mais.
---

# li-audit

A única fonte honesta do que funciona para uma conta é a própria conta.
Toda regra de todo guia de LinkedIn, incluindo as deste pacote, é um palpite
inicial. Os últimos 30 posts do usuário são a evidência.

Escreva a análise em **português do Brasil**.

## Entrada

Peça o que o usuário tiver:

- A exportação de métricas dos posts (LinkedIn: Análises -> Conteúdo ->
  Exportar). CSV ou XLSX.
- Ou um print por post com impressões, reações, comentários e
  compartilhamentos.
- Ou só os posts e o número de reações, o que já basta para uma primeira
  passada.

Leia também `.claude/linkedin/log.md` (ou `~/.claude/linkedin/log.md`) se
existir, porque ele registra a fórmula de gancho de cada post.

## O que medir de verdade

Impressões brutas são o número menos útil da página, porque dependem
principalmente de quantas pessoas já seguem o usuário. Calcule estes, e
mostre a conta:

| métrica | como | o que diz |
| --- | --- | --- |
| **Taxa de engajamento** | (reações + comentários + compartilhamentos) / impressões | se o post mereceu o alcance que teve |
| **Proporção de comentários** | comentários / reações | se começou uma conversa ou só ganhou um aceno |
| **Multiplicador de alcance** | impressões / número de seguidores | se foi além do público que já existe |
| **Taxa de salvamento/envio** | se disponível | o melhor indicador isolado de alcance futuro |

Ordene por taxa de engajamento e multiplicador de alcance, não por
impressões. Um post com 900 impressões e 40 comentários ganhou daquele com
12.000 impressões e 6.

## Depois ache o padrão

Com os 5 melhores e os 5 piores lado a lado, procure o que realmente separa
os dois grupos, e esteja disposto a concluir algo que o usuário não vai
gostar de ouvir:

- Fórmula de gancho. Quais números do `hooks.json` estão entre os 5 melhores?
- Formato. Texto, documento, imagem, vídeo.
- Tamanho.
- Tema.
- Dia e horário. Confira isso **por último**, e só se os outros quatro não
  mostrarem nada. Quase nunca é a causa, e é onde as pessoas querem que seja.
- Comentários na primeira hora. Posts em que o usuário respondeu na primeira
  hora contra os que não.

Apresente cada conclusão como uma afirmação com a evidência junto, e diga o
quanto ela é confiável. Com 30 posts dá para ver um padrão; com 6 não dá, e
você deve dizer isso em vez de inventar um.

## Saída

```
AUDITORIA  ·  31 posts  ·  12/jun - 05/set

5 MELHORES POR TAXA DE ENGAJAMENTO
  8,1%  #3  Confissão de Erro  "R$ 18.000 foi o que a falta de contrato me custou"  1.940 imp
  6,4%  #20 Abandono           "Demiti meu cliente que mais pagava"                 2.210 imp
  ...

5 PIORES
  0,4%  #5  Lista              "7 ferramentas que todo empreendedor precisa"       11.400 imp
  ...

O QUE OS DADOS DIZEM
1. Posts em que você foi quem se deu mal: média de 6,2% contra 1,1% do
   resto. n=6. É o seu sinal mais forte, e com folga.
2. Listas de ferramentas ganham impressões e mais nada. Muito alcance, zero
   comentário, zero lead. Três dos seus cinco piores.
3. Dia da semana não mostra nada. Sua média de terça e a de sexta estão
   dentro do ruído. Pare de otimizar isso.

PARAR: listas de ferramentas.
FAZER MAIS: os posts com um custo que você pagou, e um número.
```

Depois passe as conclusões para o `/li-plan`, para o plano da próxima semana
ser construído sobre a evidência do próprio usuário, e não sobre padrões
genéricos.
