---
name: li-human
description: >-
  Tira a assinatura de máquina de qualquer rascunho em português - travessões,
  clichês de IA, caracteres invisíveis - e dá uma nota num painel de cinco
  testes antes de sair. Use sempre que um texto precisar soar humano, quando o
  usuário disser "humaniza", "isso parece IA?", "tira os travessões", "tira os
  clichês", "vai ser detectado?", ou antes de mostrar ao usuário qualquer
  post, comentário, resposta ou mensagem de LinkedIn.
---

# li-human

Há duas ferramentas nesta pasta e as duas funcionam de verdade. Use-as. Não
avalie no olho.

```bash
python3 .claude/skills/li-human/humanize.py rascunho.txt --report   # limpa e mostra o que mudou
python3 .claude/skills/li-human/detect.py rascunho.txt              # dá a nota, cinco testes
python3 .claude/skills/li-human/detect.py antes.txt depois.txt      # mostra a diferença
```

(Os caminhos acima partem da raiz do projeto. Grave os rascunhos no
diretório temporário da sessão, não no repositório.)

As duas leem `slop.json`, o léxico adaptado para português: mais de 160
palavras e expressões-clichê com trocas simples, 17 classes de caracteres
invisíveis, 13 substituições tipográficas e 13 vícios estruturais. Ele foi
feito para ser editado. Se o usuário usa de verdade alguma palavra que o
léxico remove ("fundamental", "essencial", "jornada"), apague a entrada.

## O que é corrigido automaticamente

**1. Caracteres invisíveis.** Zero-width spaces e joiners, word joiners,
hífens suaves, BOMs, caracteres de tag Unicode, espaços rígidos e estreitos.
Teclado nenhum produz isso. Eles sobrevivem ao copiar e colar, são invisíveis
em qualquer editor e são o sinal mais mecânico de texto gerado. O
`humanize.py` apaga todos, inclusive qualquer outro caractere de formatação
Unicode que ele não conheça pelo nome.

**2. Tipografia.** Travessão vira vírgula, meia-risca vira hífen, aspas
curvas e angulares viram retas, reticências viram três pontos, marcador vira
hífen. O travessão é o que importa: ` — ` vira `, ` e a pontuação dupla que
sobra é limpa. Travessão de diálogo no início da linha é só removido, então
revise falas depois.

**3. O léxico de clichês.** alavancar, potencializar, robusto, disruptivo,
inovador, holístico, jornada, ecossistema, sinergia, "além disso", "vale
ressaltar que", "no mundo acelerado de hoje", "é com grande alegria que",
"pense nisso" e o resto, cada um trocado por uma palavra simples, mantendo
maiúsculas e sem mexer em URLs. Quando uma expressão no início da frase é
removida, a palavra seguinte ganha a maiúscula.

## O que NÃO é corrigido automaticamente

Vícios estruturais são **apontados, não reescritos**, porque mudar a forma
de uma frase exige julgamento:

- "Não é só X, é Y", "não só X, mas também Y" e "não é sobre X, é sobre Y"
- Tríades (regra de três)
- Linhas com pergunta retórica de uma palavra: "O resultado?"
- "E sabe o que é mais...?"
- Emoji de foguete, fogo, lâmpada, brilho e alvo
- Paredes de hashtag
- Isca de engajamento automática: "Concorda?", "E você?", "Quem mais...?"
- Gerundismo: "vou estar enviando"
- Frases todas do mesmo tamanho e bullets todos do mesmo tamanho

Essa lista é trabalho seu. Reescreva cada linha apontada à mão, mantendo o
sentido, e rode o `detect.py` de novo. É essa parte que leva a nota de
REVISAR para APROVADO, e é a parte que um script não faz.

Atenção também a trocas que deixam a frase repetitiva ou com concordância
estranha (por exemplo "inovadora, disruptiva" vira "nova, nova"). Releia o
texto limpo antes de mostrar.

## Os cinco testes

O `detect.py` dá uma nota de 0 a 100 para cinco sinais. Quanto maior, mais
humano:

| teste | o que mede | como fica quando é máquina |
| --- | --- | --- |
| RITMO | variação no tamanho das frases | todas as frases do mesmo tamanho |
| CONCRETUDE | números, nomes, marcadores concretos por 100 palavras | substantivos abstratos, nenhum número |
| CLICHÊS | ocorrências do léxico por 100 palavras | vocabulário pronto |
| ASSINATURA | invisíveis, travessões, aspas curvas por 1.000 caracteres | tipografia perfeita demais |
| VOZ | marcas de oralidade, primeira/segunda pessoa, vícios estruturais | nenhuma oralidade, revelações encenadas |

No português, o teste de VOZ conta marcas de oralidade ("pra", "tá", "né",
"a gente", "aí") no lugar das contrações do inglês, e pronomes de primeira e
segunda pessoa. Como o português omite muito o sujeito ("fiz", "aprendemos"),
a meta de pronomes é menor. Um texto formal, de uma voz que não usa
oralidade, vai perder pontos aqui. Nesse caso respeite o `voice.md` e explique
a nota em vez de forçar gíria.

O veredito pesa a média em 60% e o **teste mais fraco** em 40%, porque um
detector só precisa de um sinal para disparar. APROVADO exige nota geral de
70+ sem nenhum teste abaixo de 55.

## Seja honesto

São cinco heurísticas locais inspiradas nos sinais que detectores públicos
usam. Rodam inteiramente na máquina, nada é enviado. **Não** são GPTZero,
Originality, Copyleaks, Winston ou Turnitin, não chamam essas APIs e não
garantem o veredito deles. Corrigir o que elas medem costuma mover esses
números, porque medem as mesmas coisas de fundo. Essa é a afirmação. Não
faça uma maior em nome do usuário, e nunca diga que o texto é "indetectável".

## Ordem das operações

1. `humanize.py rascunho.txt -o limpo.txt --report`
2. Leia os vícios estruturais apontados. Reescreva essas linhas você mesmo.
3. `detect.py rascunho.txt limpo.txt` para mostrar o antes e depois.
4. Se o veredito não for APROVADO, corrija o teste mais fraco indicado na
   saída e repita. Duas rodadas é normal. Cinco significa que o rascunho foi
   escrito por fórmula, e a solução é outro rascunho, não mais passadas.
5. Mostre ao usuário o texto limpo e a nota. Nunca só a nota.
