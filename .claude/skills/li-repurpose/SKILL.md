---
name: li-repurpose
description: >-
  Transforma um conteúdo longo - vídeo do YouTube, podcast, newsletter, artigo,
  transcrição ou call com cliente - numa semana de posts de LinkedIn. Use
  quando o usuário disser "reaproveita isso", "transforma isso em posts",
  "tenho um vídeo/newsletter/transcrição", ou colar um conteúdo longo e
  quiser levar para o LinkedIn.
---

# li-repurpose

Um bom conteúdo longo tem de quatro a seis posts dentro. A maioria das
pessoas tira um e joga o resto fora.

Escreva os posts em **português do Brasil**, mesmo que a fonte esteja em
outro idioma (nesse caso, adapte exemplos e moedas, não traduza literalmente).

## Entrada

Uma transcrição, um artigo, uma newsletter, um roteiro, um resumo de call.
Se o usuário mandar um link do YouTube e houver uma ferramenta de
transcrição disponível na sessão, use; senão, peça para colar o texto. Leia
tudo antes de extrair qualquer coisa.

## Extraia, não resuma

Resumo de vídeo não é post. Ninguém quer o resumo. Percorra o conteúdo e
tire as coisas que funcionam sozinhas:

| extrair | o que é |
| --- | --- |
| **Afirmações** | toda frase que começaria uma discussão |
| **Números** | todo valor, custo, prazo, porcentagem |
| **Histórias** | todo momento com uma pessoa, uma cena e um custo |
| **Mecanismos** | toda explicação do tipo "funciona assim..." |
| **Erros** | toda admissão de algo que deu errado |
| **Frases** | toda frase que já pode ser citada como está |

Liste o que encontrou, com contagens, antes de escrever qualquer coisa. Se o
conteúdo render menos de quatro itens, ele é raso, e quatro posts espremidos
dele também vão ser. Diga isso.

## Depois monte a semana

Cada item extraído vira um post, e cada post precisa se sustentar sozinho:
o leitor não viu o vídeo e nunca vai ver. Nunca escreva "como falei no meu
último vídeo". O post é a coisa.

Atribua uma fórmula de gancho de `li-post/hooks.json` a cada um, e varie:
cinco posts da mesma fonte com o mesmo formato de gancho parecem fábrica de
conteúdo.

Ordene na semana para a afirmação mais forte ir primeiro, a história no
meio da semana e o post de mecanismo por último, quando quem gostou dos
anteriores está esperando por ele.

## Saída

```
FONTE: "Por que acabamos com as calls de diagnóstico" (18 min, 3.400 palavras)

ENCONTRADO  4 afirmações, 6 números, 2 histórias, 3 mecanismos, 1 erro, 5 frases citáveis

SEMANA
TER  #1  Contra a Corrente  Call de diagnóstico é o imposto que você paga por um site ruim
QUA  #17 Âncora de Tempo    Ganhamos 6 horas por semana apagando um link de agenda
QUI  #9  Abertura em Cena   "Bora marcar uma call rapidinha?"
SEX  #21 Valor Direto       O formulário de 4 perguntas que substituiu a call. Pode copiar.

Diga "escreve terça" e eu faço o rascunho.
```

Depois escreva sob pedido, um de cada vez, cada um pelo `/li-post` e pelo
`/li-human`. Não despeje quatro posts prontos de uma vez: vão soar todos
iguais, e o usuário não vai editar nenhum.
