# Acceptance Criteria — Pomodoro Timer com Tarefas

## Objetivo do documento

Este documento define as condições que a primeira versão do Pomodoro Timer com Tarefas deve cumprir para ser considerada pronta para entrega. Critérios de aceite servem justamente para transformar requisitos em condições objetivas de validação, reduzindo ambiguidade sobre o que significa “pronto”.[cite:104][cite:105][cite:108]

## Regra geral de aceitação

O MVP só pode ser considerado concluído quando o app permitir ao usuário criar tarefas, selecionar uma tarefa ativa, executar ciclos Pomodoro corretamente e visualizar progresso do dia sem erros evidentes de fluxo ou contagem. Os critérios abaixo devem ser tratados como checklist verificável de conclusão.[cite:106][cite:117]

## 1. Critérios de interface

### AC-UI-01 — Estrutura principal visível

**Dado** que o usuário abriu o app,  
**quando** a interface carregar,  
**então** a tela deve exibir de forma clara:

- nome do app;
- card principal do timer;
- área de tarefas;
- área de resumo ou estatísticas do dia.

### AC-UI-02 — Leitura imediata do estado atual

**Dado** que o usuário está vendo o timer,  
**quando** observar a área principal,  
**então** ele deve identificar sem esforço:

- modo atual (foco, pausa curta ou pausa longa);
- tempo restante;
- tarefa ativa;
- estado do cronômetro (parado, rodando ou pausado).

### AC-UI-03 — Responsividade mínima

**Dado** que o app é acessado em desktop ou mobile,  
**quando** a interface for aberta em telas comuns,  
**então** os elementos principais devem permanecer legíveis, clicáveis e sem quebra grave de layout.

## 2. Critérios do timer

### AC-TIMER-01 — Timer inicia corretamente

**Dado** que existe uma tarefa ativa selecionada,  
**quando** o usuário clicar em iniciar,  
**então** o timer deve começar a contagem regressiva do modo foco com duração padrão de 25 minutos.[cite:113][cite:116]

### AC-TIMER-02 — Timer pausa corretamente

**Dado** que uma sessão está em andamento,  
**quando** o usuário clicar em pausar,  
**então** a contagem deve ser interrompida sem perder o tempo restante.

### AC-TIMER-03 — Timer retoma corretamente

**Dado** que uma sessão foi pausada,  
**quando** o usuário clicar em retomar,  
**então** a contagem deve continuar a partir do tempo restante anterior.

### AC-TIMER-04 — Reset do ciclo atual

**Dado** que uma sessão de foco ou pausa foi iniciada,  
**quando** o usuário clicar em resetar,  
**então** o modo atual deve voltar ao tempo padrão daquele ciclo e permanecer parado.

### AC-TIMER-05 — Transição para pausa curta

**Dado** que uma sessão de foco foi concluída e ainda não completou quatro ciclos de foco,  
**quando** o tempo chegar a zero,  
**então** o app deve transicionar para pausa curta de 5 minutos.[cite:113][cite:116]

### AC-TIMER-06 — Transição para pausa longa

**Dado** que quatro sessões de foco foram concluídas,  
**quando** a quarta sessão terminar,  
**então** o próximo descanso deve ser uma pausa longa com duração padrão de 15 minutos.[cite:113]

### AC-TIMER-07 — Pausas não contam como pomodoro

**Dado** que o usuário concluiu uma pausa curta ou longa,  
**quando** a sessão de descanso terminar,  
**então** essa etapa não deve incrementar o número de pomodoros concluídos.

## 3. Critérios de tarefas

### AC-TASK-01 — Criar tarefa

**Dado** que o usuário está na área de tarefas,  
**quando** informar um nome válido e confirmar,  
**então** a tarefa deve ser adicionada à lista imediatamente.

### AC-TASK-02 — Editar tarefa

**Dado** que uma tarefa já existe,  
**quando** o usuário editar seu nome e salvar,  
**então** o novo nome deve aparecer corretamente na lista.

### AC-TASK-03 — Excluir tarefa

**Dado** que uma tarefa existe,  
**quando** o usuário optar por excluí-la,  
**então** ela deve ser removida da lista e não deve mais receber sessões futuras.

### AC-TASK-04 — Concluir tarefa

**Dado** que uma tarefa existe,  
**quando** o usuário marcá-la como concluída,  
**então** ela deve ser exibida visualmente como concluída e não deve receber novos pomodoros automaticamente.

### AC-TASK-05 — Selecionar tarefa ativa

**Dado** que há uma ou mais tarefas na lista,  
**quando** o usuário escolher uma delas como ativa,  
**então** essa tarefa deve aparecer destacada e ser vinculada ao próximo ciclo de foco.

## 4. Critérios de progresso por tarefa

### AC-PROGRESS-01 — Estimativa por tarefa

**Dado** que uma tarefa foi criada,  
**quando** o usuário definir o número estimado de pomodoros,  
**então** esse valor deve ficar visível na tarefa.

### AC-PROGRESS-02 — Incremento automático de concluídos

**Dado** que uma sessão de foco foi concluída com uma tarefa ativa selecionada,  
**quando** o timer chegar ao fim,  
**então** o campo de pomodoros concluídos da tarefa deve aumentar em 1.[cite:91][cite:93]

### AC-PROGRESS-03 — Progresso visível

**Dado** que a tarefa possui estimativa e sessões concluídas,  
**quando** o usuário visualizar a lista,  
**então** ele deve conseguir entender facilmente o progresso atual daquela tarefa.

## 5. Critérios de regras de negócio

### AC-RULE-01 — Tarefa ativa obrigatória

**Dado** que o usuário tenta iniciar um ciclo de foco sem tarefa ativa,  
**quando** clicar em iniciar,  
**então** o sistema deve impedir o início ou solicitar claramente a seleção de uma tarefa antes de continuar.

### AC-RULE-02 — Contagem correta do dia

**Dado** que uma sessão de foco foi concluída com sucesso,  
**quando** o sistema atualizar as métricas do dia,  
**então** o total de pomodoros do dia deve aumentar em 1.[cite:56][cite:91]

### AC-RULE-03 — Sessão incompleta não conta

**Dado** que o usuário interrompe uma sessão antes do fim,  
**quando** sair, resetar ou trocar o estado sem concluir o tempo total,  
**então** essa sessão não deve ser registrada como pomodoro concluído.[cite:56]

### AC-RULE-04 — Minutos focados do dia

**Dado** que uma sessão de foco foi concluída,  
**quando** as métricas forem atualizadas,  
**então** o total de minutos focados no dia deve refletir a duração completa da sessão concluída.[cite:91][cite:101]

## 6. Critérios de resumo diário

### AC-DAY-01 — Estatísticas mínimas visíveis

**Dado** que o usuário concluiu ao menos uma sessão ou tarefa,  
**quando** olhar o resumo do dia,  
**então** deve visualizar pelo menos:

- total de pomodoros concluídos;
- total de minutos focados;
- quantidade de tarefas concluídas.[cite:56][cite:91]

### AC-DAY-02 — Atualização em tempo real

**Dado** que o usuário conclui uma sessão de foco ou conclui uma tarefa,  
**quando** o evento acontecer,  
**então** o resumo diário deve atualizar sem necessidade de recarregar a página.

## 7. Critérios de experiência

### AC-UX-01 — Uso sem onboarding obrigatório

**Dado** que o usuário acessa o app pela primeira vez,  
**quando** a interface abrir,  
**então** ele deve conseguir começar a usar a ferramenta sem depender de cadastro, tutorial extenso ou configuração complexa.[cite:83][cite:111]

### AC-UX-02 — Feedback ao concluir sessão

**Dado** que uma sessão termina,  
**quando** o tempo chegar a zero,  
**então** o app deve fornecer algum feedback visível de conclusão, indicando a mudança para a próxima etapa.

### AC-UX-03 — Clareza de ação principal

**Dado** que o usuário observa a tela principal,  
**quando** estiver pronto para começar,  
**então** deve ficar claro qual botão inicia a sessão de foco.

## 8. Critérios de pronto para entrega

O app será considerado aceito para a V1 quando todos os itens abaixo forem verdadeiros:

- é possível criar, editar, concluir e excluir tarefas;
- é possível selecionar uma tarefa ativa;
- o timer inicia, pausa, retoma e reseta corretamente;
- sessões de foco contam pomodoros corretamente;
- a lógica de pausa curta e pausa longa funciona;
- o progresso por tarefa é atualizado após sessões concluídas;
- o resumo diário reflete uso real do app;
- a interface é legível e funcional em desktop e mobile;
- não existem falhas graves no fluxo principal de uso.[cite:104][cite:108][cite:114]

## 9. Orientação para validação no Claude Code

Ao implementar este app, a validação não deve se limitar à leitura do código. A checagem ideal precisa confirmar comportamento real da interface e do fluxo principal, já que boas práticas de verificação enfatizam evidência observável em vez de suposição de funcionamento.[cite:109][cite:118]

Ao final da implementação, a validação deve confirmar explicitamente:

- o que foi implementado;
- o que foi testado;
- o que passou;
- o que falhou, se houver;
- quais passos permitem verificar manualmente o app.

Esse padrão reduz respostas vagas como “deve funcionar” e aumenta a confiabilidade do resultado final.[cite:109][cite:112][cite:118]
