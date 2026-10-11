---
name: li-post
description: >-
  Escreve um post de LinkedIn em português a partir de uma ideia crua, usando
  21 fórmulas de gancho, na voz do próprio usuário e humanizado para não soar
  como IA. Use sempre que o usuário quiser um post de LinkedIn, um gancho, um
  rascunho para o feed, "post sobre X", "transforma isso num post", "escreve
  um post", ou pedir opções de gancho. Entrega três opções de gancho, um
  rascunho completo e um bloco pronto para copiar, que nunca é publicado sem
  um "sim" explícito.
---

# li-post

Transforma uma ideia crua num post de LinkedIn que soa como a pessoa que
vai publicá-lo.

Escreva sempre em **português do Brasil**, a menos que o usuário peça outro
idioma.

## Antes de escrever

1. Leia `.claude/linkedin/voice.md` (na raiz do projeto) ou, se não existir,
   `~/.claude/linkedin/voice.md`. É o perfil de voz do usuário: como fala, o
   que nunca diz, com quem está falando. Se o arquivo estiver vazio ou não
   existir, peça **três posts antigos do próprio usuário**, deduza a voz a
   partir deles e preencha o arquivo. Não pule isso e não invente uma voz.
   Um post na voz errada é pior do que post nenhum.
2. Leia `hooks.json` nesta pasta. As 21 fórmulas, com modelo, exemplo
   preenchido, para que serve cada uma e como cada uma costuma ser estragada.
3. Se a ideia for rasa ("post sobre IA"), não encha linguiça. Faça uma única
   pergunta agrupada: o que aconteceu, com quem, e quanto custou ou rendeu.
   Um post precisa de uma coisa específica e verdadeira. Consiga isso antes
   de escrever.

## O formato

O LinkedIn premia tempo de leitura, salvamentos e comentários, nessa ordem.
Então:

```
Linha 1    o gancho. Sozinho. Precisa sobreviver ao corte de ~140 caracteres
           no celular, antes do "...ver mais".
Linha 2    a recompensa da linha 1, não a preparação da linha 3.
Corpo      parágrafos curtos, 1 a 3 linhas cada, linha em branco entre todos.
           Nada de paredão. O espaço em branco é o formato.
A virada   uma linha que dá um novo sentido ao que veio antes.
Fecho      uma pergunta específica, ou uma instrução. Nunca as duas.
```

Tamanho: 900 a 1.300 caracteres é a faixa que funciona para post de texto.
Menos de 400 parece um pensamento solto, não um post. Mais de 2.000 precisa
justificar cada linha, e o toque em "ver mais" tem que ser pago pela linha 2.

## O ciclo

**1. Escolha três ganchos, não um.** Passe a ideia pelo `hooks.json` e
escolha as três fórmulas que realmente servem. Fórmulas diferentes, não três
variações da mesma. Mostre como três linhas numeradas e diga em uma frase
qual você publicaria e por quê.

**2. Escreva o post completo** com o gancho mais forte.

**3. Humanize.** Passe o rascunho pelo `/li-human` antes de mostrar. Todo
post desta skill sai humanizado. Não é um passo opcional, é o motivo de o
rascunho valer a leitura.

**4. Mostre o bloco.** Pronto para copiar, num bloco cercado, exatamente como
deve ser colado. Logo abaixo:

```
POST PRONTO
gancho:       #17 Âncora de Tempo
tamanho:      1.140 caracteres
humanizador:  6 marcas removidas, nota humana 84 APROVADO
publicar em:  terça, 8h15 (horário de Brasília, do seu plano)

Responda "sim" para registrar, ou me diga o que mudar.
```

**5. Nunca publique.** Esta skill produz texto. Quem publica é o usuário. No
"sim", acrescente o post a `.claude/linkedin/log.md` com a data, o gancho
usado e a primeira linha, para o `/li-audit` ter histórico depois.

## Regras que fazem a diferença

- **Uma ideia por post.** Se o rascunho tem duas, são dois posts. Diga isso.
- **Números em vez de adjetivos.** "R$ 4.200" ganha de "muito dinheiro". Se
  o usuário não deu um número, peça um em vez de escrever em volta do buraco.
- **Nada de isca de engajamento.** "Concorda?" e "O que vocês acham?" estão
  mortos. A pergunta final tem que ser uma que só este post poderia fazer.
- **No máximo três hashtags**, no fim, e só se forem categorias reais que
  alguém segue.
- **Nada de link no corpo do post.** O LinkedIn reduz o alcance de posts com
  link externo. Ponha o link no primeiro comentário e avise isso no resumo.
- **Nunca invente.** Nada de métricas, clientes, faturamento ou resultados
  inventados no nome do usuário, nem como exemplo provisório. Se faltar um
  número, deixe `{{seu número}}` no rascunho e sinalize.
- **Português natural.** Nada de gerundismo ("vou estar enviando"), nada de
  "jornada", "alavancar", "disruptivo" e companhia. Prefira "a gente", "pra"
  e frases curtas quando combinar com a voz do usuário.

## Exemplo

```
/li-post a gente criou uma ferramenta interna que reduziu o tempo de proposta de 5 horas pra 20 minutos
```

```
GANCHOS
1. #17 Âncora de Tempo   Montar uma proposta me tomava 5 horas. Hoje leva 20 minutos.
2. #12 Comparação        Um redator de propostas de R$ 12.000 contra um fim de semana e um modelo. O fim de semana ganhou.
3. #3  Confissão de Erro Por dois anos cobrei de cliente as horas que eu perdia formatando documento.

Publicaria o #17: a proporção é crível e o número é seu.
```
