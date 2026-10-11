---
name: li-profile
description: >-
  Dá uma nota de 0 a 100 a um perfil de LinkedIn com uma rubrica de 12 itens e
  reescreve as partes que perdem pontos - título, sobre, experiência,
  destaques, capa. Use quando o usuário disser "otimiza meu perfil", "dá uma
  nota pro meu LinkedIn", "reescreve meu título", "arruma meu sobre", ou colar
  o perfil e perguntar como ele soa.
---

# li-profile

Perfil não é currículo. Currículo responde "o que você já fez". Perfil
responde "vale a pena mandar mensagem para essa pessoa", e responde em uns
quatro segundos, pelo título e pelas duas primeiras linhas do "Sobre".

Escreva as reescritas em **português do Brasil**, a menos que o usuário
queira o perfil em outro idioma.

## Entrada

Peça ao usuário para colar: título (headline), seção "Sobre", cargo atual e
as duas últimas experiências, e se ele tem imagem de capa e seção de
destaques. Um print do topo do perfil basta para a primeira passada. Não
entre no LinkedIn em nome dele.

## Dê a nota

Leia `rubric.json` nesta pasta. Doze itens, 100 pontos, cada um com o que
vale nota cheia. Avalie todos, mostre a tabela e dê o total. Seja honesto: a
maioria dos perfis fica entre 30 e 49 na primeira passada, e nota generosa
não serve para nada.

```
NOTA DO PERFIL  41/100

  título              3/12   só o cargo, sem resultado, sem público
  sobre, 2 linhas     2/10   abre com "apaixonado por"
  sobre, corpo        4/10   histórico, não oferta
  destaques           0/8    vazio
  capa                0/6    azul padrão
  ...
```

## Depois reescreva, nesta ordem

Corrija em ordem decrescente de pontos perdidos. Não reescreva tudo de uma
vez: o usuário precisa colar cada parte de fato.

**1. Título (220 caracteres).** A fórmula que funciona:
`{o que você faz e para quem} | {prova} | {como começar}`. Não é o seu
cargo. Não comece com "Ajudo X a fazer Y", que metade dos perfis já usa.
Dê três opções.

**2. Sobre, primeiras duas linhas.** Tudo depois da linha 2 fica atrás do
"ver mais" no celular, então essas duas linhas são a seção inteira para a
maioria dos leitores. Elas precisam dizer quem você ajuda e o que muda. Nada
de "apaixonado por", "focado em resultados", "profissional dinâmico", bio em
terceira pessoa ou abrir com o próprio nome.

**3. Sobre, corpo.** Escrito para um leitor só, falando com "você".
Estrutura: o problema que ele tem, o que você faz a respeito, uma prova com
número, o que fazer em seguida. Menos de 1.400 caracteres, mesmo com o
limite de 2.600.

**4. Destaques.** Três itens: o melhor post, a prova (case, resultado,
depoimento) e o jeito de entrar em contato. Destaques vazios custam oito
pontos e é o único lugar do perfil que você controla por completo.

**5. Experiência.** Cada cargo tem uma linha de escopo e dois a três bullets
que são resultados com números, não atribuições. Corte tudo com mais de dez
anos para uma linha só.

**6. Capa.** Uma frase de posicionamento e um jeito de te encontrar. O
degradê azul padrão é o sinal mais claro da página de que não tem ninguém
em casa.

## Saída

Tabela de notas, depois as reescritas em blocos prontos para copiar, na
ordem de correção, cada uma já passada pelo `/li-human`. Dê a nota de novo
no fim e mostre a diferença com honestidade: se a reescrita chega a 88 e não
a 98, diga 88, e diga o que os pontos restantes exigem (geralmente
recomendações, uma capa de verdade e histórico de posts, coisas que nenhuma
reescrita cria).

Esta skill não salva nada no LinkedIn. O usuário cola cada seção.
