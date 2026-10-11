---
name: li-carousel
description: >-
  Monta um post em documento (carrossel) para o LinkedIn - o texto slide a
  slide, a capa que faz a pessoa deslizar e o PDF para subir. Use quando o
  usuário disser "carrossel", "post em documento", "slides pro LinkedIn",
  "transforma isso num carrossel", ou tiver uma ideia em formato de lista que
  morreria como post de texto.
---

# li-carousel

Post em documento é o formato com maior tempo de leitura no LinkedIn, porque
cada deslizada conta e uma rolagem não. O formato premia uma ideia quebrada
em etapas. Pune um post de texto picado em pedaços.

Escreva os slides em **português do Brasil**.

## Quando usar em vez de um post de texto

Use carrossel quando a ideia tem **sequência**: passos, uma contagem
regressiva, uma progressão de antes e depois, um método com partes. Use post
de texto quando a ideia é uma afirmação só. Espalhar uma afirmação em oito
slides é o jeito mais comum de um carrossel falhar, e se for isso que o
usuário tem, diga e mande para o `/li-post`.

## Estrutura

8 a 12 slides. Menos de 8 é post de texto. Mais de 12 e a taxa de conclusão
despenca.

```
1        CAPA       o gancho, 6 palavras ou menos, mais uma linha de promessa
2        O QUE ESTÁ EM JOGO   por que isso importa, numa frase
3-N      UMA IDEIA POR SLIDE. Um título de 3 a 7 palavras e no máximo 25
                    palavras embaixo. Se o slide precisa de um parágrafo,
                    são dois slides.
N+1      RESUMO     tudo como lista, para o print ser útil
ÚLTIMO   CHAMADA    uma ação. Seguir, comentar uma palavra-chave ou o link. Uma.
```

## Regras do texto dos slides

- **O slide 1 é 80% do resultado.** Seis palavras. Grande. O resto não salva
  uma capa que ninguém desliza.
- **Numere todos os slides** (3/10). A conclusão sobe quando a pessoa vê o
  fim.
- **Nenhum slide é parágrafo.** Se não cabe em 25 palavras, divida.
- **O slide de resumo é o que as pessoas printam.** Faça ele funcionar
  sozinho.
- **O @ do usuário em todos os slides**, pequeno, no canto de baixo. O print
  viaja sem você.
- Português é cerca de 20% mais longo que inglês: corte palavras sem dó para
  manter os limites.

## Fazendo o PDF

O LinkedIn quer PDF, 1080x1350 (4:5) para ocupar mais espaço no feed, menos
de 100 MB, menos de 300 páginas. Monte em HTML e imprima em PDF:

```bash
# uma página por slide, 1080x1350, sem margens
# depois: Chrome headless --print-to-pdf, ou qualquer HTML-para-PDF que você já use
```

Escreva o HTML com uma `<section>` por slide, `width:1080px; height:1350px;
page-break-after:always`, uma única cor de destaque e fonte de no mínimo
28px: as pessoas leem isso no celular, em tamanho de miniatura. Garanta que
a fonte tenha os acentos do português (á, ã, ç, ê, õ). Se o projeto tiver
uma skill de marca ou um design system, use e não invente paleta.

## Saída

Primeiro o texto slide a slide, como lista numerada que o usuário lê em dez
segundos. Depois o **texto do post** que acompanha: um carrossel ainda
precisa de 2 a 3 linhas em cima, que são o gancho de verdade no feed. Passe
os dois pelo `/li-human`. Só monte o PDF se o usuário aprovar o texto.

Nada é enviado ao LinkedIn. O usuário publica o PDF.
