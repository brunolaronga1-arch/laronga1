# Skills de LinkedIn (pt-BR)

Onze skills para Claude Code que ajudam a cuidar de uma conta no LinkedIn,
adaptadas para português do Brasil a partir do
[linkedin-agent-skill](https://github.com/Jakeschincariol/linkedin-agent-skill)
de Jake Schincariol (licença MIT, ver `LICENSE-linkedin-agent-skill`).

**Nada é publicado automaticamente.** As skills escrevem; você cola e publica.

## Primeiro passo

Preencha `.claude/linkedin/voice.md` (ou cole três posts seus no Claude e
peça "escreve meu voice.md a partir destes"). Todas as skills leem esse
arquivo. O histórico (`log.md`) e o plano da semana (`plan.md`) também ficam
em `.claude/linkedin/`.

## Comandos

| comando | o que faz |
| --- | --- |
| `/li-post` | Uma ideia vira post: 3 opções de gancho (21 fórmulas), 1 rascunho, já humanizado |
| `/li-comment` | Comentários em posts de outras pessoas, 9 tipos, nunca "Ótimo post!" |
| `/li-reply` | Respostas aos comentários do seu post, por prioridade |
| `/li-profile` | Nota de 0 a 100 para o perfil e reescrita do que perde pontos |
| `/li-plan` | A semana: o que postar, quando e com quem interagir |
| `/li-human` | O humanizador: remove travessões, clichês e caracteres invisíveis e dá uma nota |
| `/li-carousel` | Carrosséis (posts em PDF), slide a slide |
| `/li-repurpose` | Um vídeo, newsletter ou transcrição vira uma semana de posts |
| `/li-dm` | Nota de convite, primeira mensagem e dois acompanhamentos |
| `/li-inbox` | Triagem da caixa de entrada |
| `/li-audit` | Análise dos posts já publicados |

## O humanizador

```bash
python3 .claude/skills/li-human/humanize.py rascunho.txt --report
python3 .claude/skills/li-human/detect.py rascunho.txt
python3 .claude/skills/li-human/detect.py antes.txt depois.txt
```

Sem dependências, roda local. O léxico em `li-human/slop.json` tem mais de
160 clichês do português de LinkedIn ("alavancar", "jornada", "disruptivo",
"vale ressaltar que", "é com grande alegria que"...) e 13 vícios estruturais
("não é só X, é Y", tríades, gerundismo, "Concorda?"). Edite à vontade.

Os cinco testes (RITMO, CONCRETUDE, CLICHÊS, ASSINATURA, VOZ) são
heurísticas locais, não o GPTZero nem outro detector comercial, e não
garantem nenhum veredito externo.

## O que mudou em relação ao original

- Todas as skills, fórmulas de gancho, rubrica e modelo de voz traduzidos e
  adaptados (reais, horário de Brasília, "ver mais", CLT/PJ...).
- `slop.json` reescrito com clichês do português.
- `detect.py`: palavras com acento, pronomes do português e marcas de
  oralidade ("pra", "tá", "né", "a gente") no lugar das contrações do inglês.
- `humanize.py`: mensagens em português, maiúscula corrigida quando uma
  expressão é removida no começo da frase, travessão de diálogo tratado.
- Arquivos de voz, log e plano no projeto (`.claude/linkedin/`) em vez de só
  em `~/.claude/linkedin/`.
