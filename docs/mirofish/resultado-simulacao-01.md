# Simulação 01: lançamento do programa de parceria da Larong

**Data:** 17/11/2026 · **Ferramenta:** MiroFish (rodado na nuvem) · **Modelo:** gpt-4o-mini (OpenAI)
**Semente:** `semente-larong.md` · **Pedido:** nº 1 de `pedidos-de-previsao.md` (lançamento do programa de parceria)

## Números da rodada

| Item | Valor |
| --- | --- |
| Grafo de conhecimento (Zep) | 71 entidades, 102 relações |
| Agentes criados | 33 (incluindo os 8 arquétipos da semente: Helena, Rafael, Marina, Tiago, Sérgio, Joel, Carla/Paulo e o representante de fabricante) |
| Rodadas | 20, em duas redes simuladas (uma estilo Twitter, outra estilo Reddit) |
| Ações | 220 no total: 14 posts, 91 comentários, 32 curtidas |

## Leitura honesta: esta rodada vale pouco como previsão

Quase todos os agentes caíram num **coro de entusiasmo genérico**: "Estou muito animado com o programa
de parceria!", "Vamos juntos transformar a iluminação!". Mesmo os personagens desenhados para serem
céticos se comportaram assim. A Marina, a lighting designer desconfiada de revendas, comentou "Estou
muito animada com o potencial que o programa da Larong oferece!".

Nos 91 comentários, nenhum mencionou **comissão, reserva técnica, transparência, autoria, A Luzia ou
preço**, que eram as tensões centrais da semente. Fornecimento Gerenciado e equalização também não
apareceram.

Esse efeito é conhecido em simulações com modelos pequenos e baratos: eles tendem a concordar com tudo.
**Não leia o "positivo" desta rodada como sinal de mercado.**

O relatório automático do MiroFish também saiu fraco. O texto ficou em chinês, porque o gerador de
seções ignora a configuração de idioma, e quase todas as citações foram tiradas da própria semente, não
das conversas dos agentes. Ele está guardado em `relatorio-automatico-01.md` só para registro.

## O que dá para aproveitar mesmo assim

Os poucos sinais que fugiram do coro:

1. **O Guia de Montagem foi o serviço mais citado espontaneamente.** Apareceu em 11 dos 91 comentários,
   e eletricistas, construtora e escritórios o chamaram de "essencial". É um bom candidato a gancho
   concreto de comunicação, porque é tangível e fácil de entender.
2. **A única objeção espontânea foi custo.** O representante de fabricante postou: *"a curadoria técnica
   pode ser uma forma de aumentar os custos"*. O Sérgio, da construtora, concordou: *"pode, em alguns
   casos, aumentar os custos sem proporcionar um valor real"*. "Curadoria" soa como "mais caro" para quem
   compra.
3. **Nas entrevistas finais, os 8 personagens principais pediram a mesma prova:** *casos reais de obra,
   com resultado e depoimento de outros profissionais*. Também pediram clareza sobre como a parceria
   funciona na prática. A Marina acrescentou *respeito ao design autoral e ética na especificação*.
4. **Paulo e Carla (cliente final)** postaram em dúvida se deveriam contratar um lighting designer. Isso
   confirma a hipótese de que o cliente final não sabe se precisa de projeto luminotécnico.

### Trechos das entrevistas (pergunta: opinião sincera, maior objeção, o que te convenceria)

- **Helena (sócia de escritório, SP):** recomendaria, desde que o programa "não aumente custos
  desnecessários" e a Larong mostre "casos de sucesso e feedback de outros profissionais".
- **Rafael (arquiteto autônomo):** maior objeção é "os custos adicionais que uma curadoria técnica pode
  acarretar"; quer "benefícios tangíveis".
- **Marina (lighting designer, RJ):** quer "compromisso real com a valorização do design autoral e a
  ética na especificação".
- **Tiago (lighting designer iniciante):** falta "clareza sobre como as parcerias se concretizam na
  prática".
- **Sérgio (construtora):** "positiva, mas cautelosa"; precisa ver "redução de custos aos projetos".
- **Joel (eletricista):** apoia, desde que a curadoria "não aumente significativamente os custos".

## Como melhorar a próxima rodada

1. **Usar um modelo mais forte**, como `gpt-4.1` ou `gpt-4o`, só para os agentes ou para tudo. Custa
   mais, mas reduz muito o efeito "todo mundo concorda".
2. **Deixar a semente mais concreta e com conflito explícito.** Por exemplo: incluir o texto real do
   programa de parceria (o que o arquiteto ganha, se há comissão e como ela é declarada), um caso de
   obra que deu errado com outra revenda e reclamações reais que vocês já ouviram.
3. **Rodar os pedidos nº 2 (lighting designers) e nº 3 (modelos de remuneração)**, que forçam o debate
   sobre autoria e reserva técnica, os pontos que esta rodada evitou.
4. **Mais rodadas (40 ou mais)** e só a rede estilo Reddit, onde houve conversa de verdade. Na rede
   estilo Twitter, 73 das 113 ações foram "não fazer nada".
