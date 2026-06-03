# CLAUDE.md — Pomodoro Timer com Tarefas

## Visão do projeto

**Pomodoro Timer com Tarefas** é um microapp estático de produtividade criado para ajudar usuários a organizar o dia, entrar em foco rapidamente e acompanhar progresso de execução em blocos curtos de trabalho. A proposta central é unir três elementos em uma experiência simples: lista de tarefas, temporizador Pomodoro e feedback visual de progresso.[cite:37][cite:53]

O produto deve funcionar como uma ferramenta prática de uso imediato, sem curva de aprendizado alta e sem exigir cadastro na primeira interação. O valor percebido precisa aparecer em poucos segundos: o usuário adiciona uma tarefa, inicia um ciclo de foco e entende com clareza o que está fazendo agora.[cite:37][cite:64]

## Stack tecnológica

- **HTML5** estruturado semanticamente.
- **CSS3** com variáveis, flexbox e grid, sem pré-processadores.
- **JavaScript (ES6+)** puro, sem frameworks.
- **LocalStorage** para persistência leve de dados do dia.
- **Sem backend**, **sem login**, **sem build**.

O app é um microapp estático, pronto para ser embutido em um artigo como widget ou página independente. A stack deve permanecer simples e leve; não usar Next.js, React, Vue, TypeScript, bundlers, ou qualquer framework pesado.[cite:152][cite:153][web:158]

## Arquitetura

### Estrutura de diretórios
pomodoro-timer/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── main.js
│ ├── timer.js
│ ├── tasks.js
│ └── storage.js
└── docs/
├── product-vision.md
├── mvp-scope.md
└── acceptance-criteria.md

text

### Responsabilidades por arquivo

- `index.html`: estrutura da página, cabeçalho, timer, tarefas e resumo.
- `css/style.css`: design system, layout, cores, tipografia, responsividade.
- `js/main.js`: inicialização, montagem da UI, coordenação de eventos.
- `js/timer.js`: motor do timer, estados, transições, contagem regressiva.
- `js/tasks.js`: CRUD de tarefas, seleção de tarefa ativa, progresso por tarefa.
- `js/storage.js`: camada de persistência local (LocalStorage).
- `docs/*`: visão, escopo e critérios de aceite do produto.[cite:66][cite:67]

### Fluxo de dados

1. O usuário interage com a UI (HTML).
2. `main.js` recebe eventos e delega para `timer.js` ou `tasks.js`.
3. `timer.js` e `tasks.js` atualizam o estado interno.
4. `storage.js` salva o estado em LocalStorage.
5. A UI é re-renderizada com o novo estado.

## Convenções de código

### JavaScript

- Usar `const` e `let`, sem `var`.
- Funções declarativas, nomeadas, com nomes claros.
- Arrow functions apenas quando a sintaxe curtar mais sem perder clareza.
- Modos estritos: `'use strict';` no início de arquivos, se necessário.
- Comentários apenas quando a lógica não é óbvia; código deve ser autoexplicativo.
- Nunca usar `eval`, `innerHTML` com dados do usuário ou qualquer técnica insegura.

### CSS

- Usar variáveis CSS para cores, espaçamentos, sombras, bordas.
- BEM simplificado para classes: `.block`, `.block__element`, `.block--modifier`.
- Mobile-first: media queries para aumentar breakpoints, não para reduzir.
- Reset básico: `box-sizing: border-box`, `margin: 0`, `padding: 0`.
- Sem frameworks de CSS como Bootstrap, Tailwind, Foundation.

### HTML

- Semântico: `<header>`, `<main>`, `<section>`, `<footer>`, `<button>`, `<input>`.
- `aria-*` apenas quando necessário para acessibilidade.
- IDs apenas quando realmente necessário para JS ou âncoras.
- Classes em vez de IDs para estilização.

## UI e design system

### Princípios

- Simplicidade antes de completude.
- Clareza visual antes de densidade funcional.
- Progresso visível antes de estatísticas complexas.
- Foco em legibilidade e uso recorrente.

### Cores

Definir paleta fixa em variáveis CSS:

- Cor primária (foco): tom vermelho/tomate.
- Cor de pausa curta: tom azul suave.
- Cor de pausa longa: tom verde suave.
- Fundo claro, texto escuro.
- Contraste suficiente para legibilidade em mobile.

### Tipografia

- Fonte sem serifa, padrão do sistema.
- Tamanhos: base 16px, títulos 20–28px, timer 48–72px.

### Layout

- Mobile-first: coluna única em telas pequenas.
- Desktop: timer à esquerda, tarefas à direita, resumo abaixo ou ao lado.
- Espaçamento consistente: 8px como base (8, 16, 24, 32).

### Estados do timer

Visualmente distinto para cada estado:

- `idle` — cor neutra.
- `focus_running` — tom vermelho/forte.
- `short_break_running` — tom azul suave.
- `long_break_running` — tom verde suave.
- `paused` — status claro, sem confusão.

## Comandos e operações

### Abrir o app

- Clicar duas vezes em `index.html` ou abrir no navegador.
- Não há npm, build ou servidor necessário.

### Validação

- Verificar se timer funciona em foco, pausa curta e longa.
- Verificar se tarefas são criadas, editadas, excluídas e concluídas.
- Verificar se pomodoros são contados na tarefa ativa e no resumo do dia.
- Verificar se o LocalStorage persiste dados entre recarregamentos.
- Verificar responsividade em desktop e mobile.

## Restrições e não fazer

### Não fazer na V1

- Login, cadastro ou autenticação.
- Sincronização em nuvem.
- Projetos, tags ou categorias.
- Estatísticas semanais/mensais.
- Integrações com calendário ou outros apps.
- Sons ambientes, música ou efeitos complexos.
- Gamificação avançada.
- Exportação de relatórios.

### Não quebrar

- Nunca remover lógica de pause/resume.
- Nunca deixar o timer contar pausas como pomodoros.
- Nunca perder o progresso ao recarregar a página.
- Nunca complicar o fluxo principal de uso.

## Aceite e validação

O build só está pronto quando:

- Todos os critérios de `docs/acceptance-criteria.md` são atendidos.
- O app funciona offline como arquivo estático.
- O fluxo principal (criar tarefa → selecionar ativa → iniciar foco → concluir sessão → ver progresso) funciona sem erros.
- A interface é legível e usável em desktop e mobile.[cite:104][cite:108]

## Workflow com Claude Code

Sempre que for implementar:

1. Ler `docs/product-vision.md`, `docs/mvp-scope.md` e `docs/acceptance-criteria.md`.
2. Resumir entendimento do que será feito.
3. Propor um plano passo a passo.
4. Implementar em etapas pequenas.
5. Validar cada etapa contra os critérios de aceite.
6. Só prosseguir quando a etapa anterior estiver clara e funcional.

Esse fluxo reduz retrabalho e mantém o alinhamento entre produto e código.[web:123][web:138]