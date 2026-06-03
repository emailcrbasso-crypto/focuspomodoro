# MVP Scope — Pomodoro Timer com Tarefas

## Objetivo do MVP

O objetivo da primeira versão é entregar uma ferramenta simples, útil e agradável que permita ao usuário selecionar uma tarefa, executar ciclos Pomodoro e visualizar progresso ao longo do dia. Como MVP, o foco deve estar na menor combinação possível de funcionalidades que valide uso real e percepção de valor com baixo atrito.[cite:83][cite:98]

O app não deve tentar competir com plataformas completas de produtividade logo na versão inicial. A prioridade é resolver bem o caso principal de uso: entrar em foco rápido e acompanhar sessões ligadas a tarefas reais.[cite:83][cite:95]

## Job to be done

Quando o usuário tem várias coisas para fazer e dificuldade para começar, ele quer escolher uma tarefa, iniciar um bloco curto de foco e sentir progresso concreto sem precisar organizar um sistema complexo. O MVP deve atender exatamente essa necessidade central.[cite:99][cite:102]

## Escopo funcional da V1

A versão 1 deve incluir cinco capacidades principais:

1. Temporizador Pomodoro.
2. Gestão simples de tarefas do dia.
3. Associação do timer a uma tarefa ativa.
4. Registro básico de pomodoros concluídos.
5. Resumo simples de produtividade do dia.[cite:91][cite:93][cite:96]

## Funcionalidades obrigatórias

### 1. Temporizador principal

O app deve oferecer três modos de tempo:

- Foco: 25 minutos.
- Pausa curta: 5 minutos.
- Pausa longa: 15 minutos.[cite:91][cite:99][cite:102]

Também deve seguir a lógica clássica da técnica:

- Cada sessão de foco concluída conta como 1 pomodoro.
- Após 4 sessões de foco concluídas, o próximo descanso deve ser uma pausa longa.[cite:91][cite:99]

### 2. Controles do timer

O usuário deve conseguir:

- Iniciar o timer.
- Pausar o timer.
- Retomar o timer.
- Resetar o ciclo atual.
- Avançar manualmente para a próxima etapa, se isso for incluído como ação secundária.

Esses controles aparecem com frequência como base de uso em ferramentas Pomodoro e são suficientes para um fluxo prático sem excesso de complexidade.[cite:93][cite:94]

### 3. Lista de tarefas

O usuário deve conseguir:

- Adicionar uma tarefa.
- Editar o nome da tarefa.
- Marcar a tarefa como concluída.
- Excluir tarefa.
- Selecionar uma tarefa ativa.

A lista precisa ser leve e pensada para o dia atual, sem estrutura de projetos, tags ou subtarefas na V1. O objetivo é manter o foco na execução imediata.[cite:96][cite:100]

### 4. Estimativa e progresso por tarefa

Cada tarefa deve permitir dois indicadores simples:

- Pomodoros estimados.
- Pomodoros concluídos.

Esse recurso ajuda o usuário a visualizar esforço previsto versus avanço real, algo presente em produtos Pomodoro com ligação entre sessão e tarefa.[cite:53][cite:56][cite:91]

### 5. Sessão vinculada à tarefa ativa

Sempre que um ciclo de foco for concluído, o app deve registrar esse pomodoro na tarefa que estiver ativa no momento da sessão. Se não houver tarefa ativa, o app pode bloquear o início do foco ou solicitar que o usuário selecione uma tarefa antes de começar.[cite:93][cite:102]

### 6. Resumo diário

O MVP deve mostrar um resumo simples do dia com pelo menos:

- Total de pomodoros concluídos.
- Total de minutos focados.
- Quantidade de tarefas concluídas.
- Tarefa com maior avanço no dia, se aplicável.[cite:56][cite:91][cite:96]

## Regras de negócio

O comportamento mínimo esperado é este:

- Uma sessão de foco concluída adiciona 1 pomodoro à contagem do dia.
- Uma sessão de foco concluída adiciona 1 pomodoro à tarefa ativa.
- Após 4 sessões de foco concluídas, o próximo modo de pausa deve ser longo.
- Pausas não contam como pomodoros.
- Tarefas concluídas não devem receber novos pomodoros, a menos que sejam reabertas.
- O contador diário deve refletir apenas as sessões concluídas, não as interrompidas.[cite:91][cite:93][cite:99]

## Estados do sistema

O app precisa lidar com estes estados centrais:

- `idle` — antes do início do timer.
- `focus_running` — sessão de foco em andamento.
- `focus_paused` — sessão de foco pausada.
- `short_break_running` — pausa curta em andamento.
- `long_break_running` — pausa longa em andamento.
- `break_paused` — pausa pausada.
- `session_completed` — etapa concluída aguardando próxima ação ou transição.

Esses estados são suficientes para controlar bem a experiência sem criar uma máquina excessivamente complexa para o MVP.[cite:93][cite:94]

## Interface mínima da V1

A interface do MVP deve conter quatro áreas:

1. Cabeçalho simples com nome do app.
2. Card principal do timer.
3. Área de tarefas.
4. Bloco de estatísticas do dia.

No card principal, o usuário deve ver com clareza:

- Modo atual.
- Tempo restante.
- Tarefa ativa.
- Progresso de ciclos.
- Botões principais de controle.[cite:56][cite:93]

## Requisitos de experiência

A versão inicial deve priorizar:

- Carregamento rápido.
- Interface responsiva.
- Baixa fricção de uso.
- Feedback visual claro ao finalizar um ciclo.
- Legibilidade forte em desktop e mobile.

Como microapp de topo e meio de funil, a ferramenta precisa parecer imediatamente útil e não exigir aprendizado complexo para começar.[cite:80][cite:83]

## Fora do escopo da V1

Para proteger o foco do MVP, estes itens não entram agora:

- Cadastro e login.
- Sincronização em nuvem.
- Projetos, tags e categorias avançadas.
- Estatísticas semanais e mensais detalhadas.
- Integrações com calendários ou gerenciadores de tarefas.
- Gamificação avançada.
- Sons ambientes, música ou biblioteca de ruídos.
- Exportação de relatórios.
- Notificações avançadas entre dispositivos.[cite:83][cite:98][cite:100]

## Critério de sucesso do MVP

A V1 será considerada bem definida se entregar uma experiência em que o usuário:

- adiciona tarefas rapidamente;
- escolhe a tarefa ativa sem confusão;
- inicia o timer sem fricção;
- conclui ciclos de foco com lógica correta de pausas;
- percebe progresso real na tarefa e no dia.[cite:99][cite:102]

## Ordem sugerida de implementação

A implementação pode ser feita nesta ordem:

1. Estrutura base da interface.
2. Motor do timer e transições de estado.
3. CRUD simples de tarefas.
4. Seleção de tarefa ativa.
5. Regras de contagem de pomodoros por tarefa e por dia.
6. Bloco de estatísticas do dia.
7. Ajustes visuais, responsividade e acabamento.

Essa sequência reduz risco porque constrói primeiro o núcleo funcional do produto e só depois adiciona métricas e refinamentos.[cite:95][cite:98]

## Definição de pronto

O MVP estará pronto quando o app permitir usar a técnica Pomodoro do início ao fim com tarefas reais, em uma interface clara, sem bugs evidentes de contagem, fluxo ou transição entre foco e pausas. O produto final precisa ser simples o suficiente para uso imediato e útil o suficiente para justificar retorno recorrente.[cite:83][cite:91][cite:96]
