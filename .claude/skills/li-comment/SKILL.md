---
name: li-comment
description: >-
  Escreve comentários em posts de outras pessoas no LinkedIn que soam como
  alguém com opinião, não um robô. Use quando o usuário colar um post e quiser
  um comentário, disser "comenta nisso", "o que eu respondo aqui", "quero
  interagir com esse post", ou quiser um lote de comentários para a rodada de
  engajamento.
---

# li-comment

Comentar é a coisa de maior alavanca no LinkedIn e a mais fácil de fazer
mal. Um comentário num post com 400 reações é visto por mais gente do que a
maioria dos seus próprios posts. Um comentário genérico não é visto por
ninguém e ainda custa credibilidade com o autor.

Escreva em **português do Brasil**, a menos que o post seja em outro idioma.
Nesse caso, comente no idioma do post.

## Entrada

O usuário cola o texto do post (e o nome e o cargo do autor, se tiver). Se
colar um print, leia. Se mandar uma URL que você não consegue abrir, peça o
texto: não adivinhe o que o post dizia e não use automação de navegador
para raspar o feed.

## Os nove tipos de comentário

Escolha pelo que o post realmente é. Nunca use o tipo 1 por padrão.

| # | tipo | quando | forma |
| --- | --- | --- | --- |
| 1 | **Acrescente um dado** | o post afirma algo que você pode sustentar com um número | "A gente viu a mesma coisa: 40% dos nossos..." |
| 2 | **Acrescente o caso que faltou** | o post está certo mas incompleto | "Isso vale até {condição}. Depois..." |
| 3 | **Discorde com respeito** | você acha de verdade que está errado | primeiro onde concorda, depois onde diverge |
| 4 | **Estenda uma linha** | uma frase do post é a boa | cite a frase e construa a partir dela |
| 5 | **Faça a pergunta de verdade** | o post pulou a parte difícil | uma pergunta, específica, sem "fiquei curioso" |
| 6 | **O comprovante** | você já fez o que o post descreve | o que aconteceu, em duas frases |
| 7 | **A correção** | há um erro factual | esteja certo, seja breve, gentil e seguro |
| 8 | **O novo enquadramento** | os fatos estão certos e a leitura errada | "Outro jeito de ler isso:" |
| 9 | **A frase única** | o post não precisa de nada, você quer presença | menos de 12 palavras, engraçada ou verdadeira |

## Regras

- **2 a 4 frases.** Mais longo parece sequestro do post. Mais curto parece
  enchimento.
- **Nunca abra com "Ótimo post"**, "Amei", "Verdade demais", "Concordo
  plenamente", "Isso me representa", "Faz total sentido" ou o primeiro nome
  do autor seguido de ponto de exclamação. Todos são invisíveis.
- **Nada de emoji na abertura.** Nada de 🔥 ou 👏 como primeiro caractere.
- **Nunca repita o post.** O autor sabe o que escreveu, e quem lê também.
- **Uma ideia.** Comentário com dois pontos parece tentativa de artigo.
- **Diga a coisa específica.** Se o comentário caberia embaixo de qualquer
  post sobre o tema, não é comentário, é ruído.
- **Discordar é permitido e funciona**, mas a concordância vem primeiro e
  tem que ser real.

## Saída

Dê **duas opções de tipos diferentes**, com rótulo, mais uma linha dizendo
qual você publicaria. Passe as duas pelo `/li-human` antes: um comentário
com travessão denuncia a máquina mais do que um post, porque comentários
são curtos e as pessoas leem com atenção.

```
OPÇÕES DE COMENTÁRIO  (no post de @autor sobre contratação)

[6 · Comprovante]
A gente testou a versão sem currículo em 3 contratações no ano passado.
Duas foram as melhores que já fizemos. A terceira foi um desastre, e a
diferença foi se a pessoa já tinha feito o trabalho antes, não como foi na
entrevista.

[3 · Discordar com respeito]
Concordo com o problema do sinal. Mas o que funcionou pra gente não foi
tirar o currículo, foi dar a todo candidato a mesma tarefa paga de 90
minutos. Mesmo resultado, muito menos discussão interna.

Publicaria o primeiro. É dado seu e admite uma falha, que é a parte que as
pessoas respondem.
```

## Modo lote

Se o usuário quiser uma rodada de engajamento, peça os 5 a 10 posts como
texto colado numa única mensagem, devolva um comentário para cada um num só
bloco e mantenha em `.claude/linkedin/log.md` uma anotação de quem ele já
comentou na semana. Comentar nas mesmas três pessoas todo dia fica visível e
parece exatamente o que é.

## Nunca

Não publique automaticamente. Não use ferramenta de navegador para publicar
comentários em nome do usuário. Publicação automática e raspagem violam o
Contrato do Usuário do LinkedIn e põem a conta em risco. Esta skill escreve
o comentário. Quem publica é o usuário.
