# Planner da Isabela — resumo do projeto

Situação em 8 de novembro de 2026. Projeto no Lovable "Little Nest Household Planner", ainda não publicado na versão atual.

## Objetivo

App de celular para organizar a rotina da casa e da Isabela (8 meses). A babá e a diarista registram o dia com toques, quase sem digitar. Os pais planejam, configuram e acompanham.

## Usuários e papéis

| Perfil | Papel no app | O que faz |
| --- | --- | --- |
| Pai e Mãe | Administradores | Planejam tarefas e agenda, gerenciam pessoas e convites, configuram avisos, cardápio, receitas, brincadeiras e estoque, acompanham o dia |
| Babá | Equipe | Registra tarefas da Isabela, o diário (sono, refeição, fralda, remédio, banho, humor, nota), atividade do dia e itens faltantes da Isabela |
| Profissional da Limpeza (diarista) | Equipe | Registra tarefas da casa e da Nala e itens faltantes da casa; dias habituais terça e quinta (configurável) |

## Funcionalidades

### Equipe (babá e diarista)
- **Hoje:** data como título, barra "X de Y feitas", card "Agora" com a próxima tarefa, restante do dia e "Feitas hoje" recolhido.
- **Tarefa:** dois botões, "Feito" (com Desfazer por 5 s) e "Não deu" (motivos prontos: Faltou produto, Isabela dormiu/não quis, Sem tempo, Outro).
- **Observações:** frases prontas que salvam ao tocar, mais texto livre opcional.
- **+ Item faltante:** botão fixo; categoria → produto em até 3 toques, ou "Outro item".
- **Estoque:** três estados (Tem, Acabando, Acabou), só da área da pessoa.
- **Registrar (só babá):** diário da Isabela em até 2 toques, hora preenchida, linha do tempo do dia, apagar o próprio registro em até 15 min.
- **Atividade do dia (babá):** brincadeira sugerida ou escolhida pelos pais, com "Fizemos".

### Pais
- **Hoje:** cards Tarefas da casa, Cuidados da Isabela e Itens faltantes; observações da equipe; linha do tempo da Isabela; tarefas do dia; cardápio.
- **Agenda:** dia, semana e mês; criar tarefa; editar só um dia ou a série; desativar; histórico.
- **Avisos por tarefa:** aviso antes (padrão 10 min) para quem executa e aviso depois se não houver registro (padrão 30 min) para quem executa e para os pais; tempos padrão em Administração → Ajustes e ajustáveis por tarefa.
- **Biblioteca:** receitas, cardápio semanal (vira tarefa da babá), brincadeiras com filtros, favoritos, nível de sujeira e vídeos (só links https de YouTube, Vimeo ou Instagram).
- **Estoque e compras:** produtos por área (Isabela, Casa, Nala); item que acaba vai para a lista de compras; ver quem pediu; marcar Reposto.
- **Administração → Pessoas:** convidar, cadastrar com senha provisória, mudar perfil, redefinir senha provisória, bloquear, desbloquear, revogar e histórico de gestão.
- **Atualização em tempo real:** o que a equipe registra aparece sem recarregar.

### Conta e acesso
- Login por celular brasileiro e senha, com mostrar/ocultar senha.
- Recuperação: pais por e-mail (link de redefinição); equipe pede aos pais uma senha provisória.
- Convite por link: os pais informam nome, celular e perfil e enviam pelo WhatsApp. A Mãe ou o Pai criam e-mail e senha; a babá e a diarista criam só a senha.
- App instalável no celular (Android e iPhone), com aviso de nova versão e modo sem internet que mostra o último dia carregado e bloqueia registros.

## Regras de acesso

- As permissões ficam no servidor (regras do banco e funções do servidor), não só nas telas.
- A babá vê e edita só tarefas e estoque da Isabela; a diarista só da casa e da Nala; a diarista não acessa o diário.
- A equipe não cria tarefas, não gerencia pessoas e não altera ajustes.
- Não há cadastro público: só o primeiro pai ou mãe (quando não existe conta), cadastro feito pelos pais ou convite válido.
- Convite: uso único, válido 7 dias, perfil travado, celular do convite obrigatório, limite de tentativas.
- Login: mensagem genérica de erro e bloqueio de 15 min após 5 senhas erradas no mesmo celular.
- Pessoa bloqueada ou revogada perde o acesso na hora, mesmo com o app aberto; revogar mantém os registros dela.
- Nenhum pai pode bloquear ou rebaixar a si mesmo, e o último pai ou mãe ativo não pode ser removido.
- Senhas existem só no serviço de autenticação, criptografadas; ninguém, nem os pais, vê a senha de outra pessoa. A senha provisória aparece uma única vez.
- Ações de gestão de pessoas ficam registradas no histórico.

## Decisões tomadas

| Tema | Decisão |
| --- | --- |
| Princípio do app | Equipe registra com toques; pais configuram |
| Recuperação de senha | Pais por e-mail; equipe pelos pais. Sem SMS e sem custo de provedor |
| Cadastro | Por convite enviado pelo WhatsApp; cadastro com senha provisória fica como alternativa |
| Formato do app | App instalável pelo navegador, sem lojas por enquanto (lojas exigiriam US$ 99/ano da Apple e US$ 25 do Google, e reenvio a cada mudança) |
| Avisos | Antes e depois da tarefa, com padrão 10 e 30 min; "Não deu" conta como registro |
| Visual | Fundo neutro levemente quente; cor por perfil (diarista verde, babá azul, pais grafite) só no destaque; status com cor só em Feito, Atrasada e Não deu; sem emojis e sem exclamações; check "desenhado à mão" no lugar do confete |
| Estoque da equipe | Três estados: Tem, Acabando, Acabou |
| Vídeos das brincadeiras | Curadoria feita pelos pais; nada é preenchido automaticamente |
| Nível de sujeira | Campo opcional preenchido pelos pais |
| E-mail de recuperação do Bruno | Cadastrado e confirmado manualmente (com registro no histórico), a pedido dele |

## Pendências

### Antes de publicar
- [ ] Aprovação do Bruno para publicar (login novo, convites, app instalável e visual só funcionam no app publicado)
- [ ] Escurecer o cinza de textos secundários (contraste 4,44:1, abaixo do mínimo de 4,5:1)
- [ ] Conferir no Android real o menu "Mais" corrigido e o visual novo

### Configuração e decisões do Bruno
- [ ] Configurar no Lovable a conexão Firebase com "Include web push" (Web API key, App ID e chave VAPID); sem isso os avisos aparecem só no sino, não no celular
- [ ] Decidir se a barra "X de Y feitas" conta "Não deu" ou só "Feito"
- [ ] Decidir se cria as categorias Roupas e Cozinha/mantimentos no estoque
- [ ] Decidir se usa domínio próprio para e-mails em português (hoje saem em inglês, de no-reply@auth.lovable.cloud)
- [ ] Decidir se busca título do vídeo para links de Vimeo e Instagram
- [ ] Decidir se mantém a mensagem "Acesso desativado", que revela que um número bloqueado existe

### Testes ainda não feitos (Plano de QA)
- [ ] E-mail de redefinição de senha chegando na caixa real do Bruno
- [ ] Criar tarefa e editar "só este dia" ou a série
- [ ] Permissões críticas: nenhuma senha visível em tabelas ou logs; nenhuma tela interna sem login; babá não apaga registro de outra pessoa; ninguém lê avisos de outra pessoa
- [ ] Convite real pelo WhatsApp e chegada do e-mail de confirmação da Mãe
- [ ] App instalável e modo sem internet em celular real
- [ ] Contraste medido, fonte grande no celular e animações desligadas

### Primeiros passos depois de publicar
- [ ] Bruno manda o convite para a Mãe e, depois, para a babá e a diarista
- [ ] Cada pessoa instala o app e ativa os avisos (após o Firebase)
