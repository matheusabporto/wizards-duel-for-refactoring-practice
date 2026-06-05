# Refatoração — Wizard Duel

## Uso de Inteligência Artificial

Este trabalho contou com o auxílio do Claude (Anthropic) como ferramenta de apoio. A IA foi utilizada para:

- Leitura e diagnóstico inicial do código
- Explicação dos conceitos envolvidos (ESLint, guia Airbnb, code smells)
- Sugestão de nomes de variáveis e estrutura de arquivos
- Geração de trechos de código durante a refatoração

Todas as decisões de implementação foram avaliadas e executadas manualmente pelo desenvolvedor.

---

## Problemas Encontrados

### 1. Nomes Sem Significado

Variáveis e parâmetros com nomes que não comunicam intenção, identificados no `index.js` e no JS do `index.html`:

| Nome original | Contexto | Nome adotado |
|---|---|---|
| `pg` | número da página da API | `pageNumber` |
| `d` | resposta do fetch | `response` |
| `r` | JSON parseado | `responseData` |
| `tmp` | array temporário | `characters` / `spells` |
| `c` | item do array de personagens | `character` |
| `a` | atributos do personagem | `attributes` |
| `obj` | objeto da carta montada | `card` |
| `pw` | atributo Poder | `power` |
| `mg` | atributo Magia | `magic` |
| `df` | atributo Defesa | `defense` |
| `x`, `y`, `z` | variáveis do shuffle | `currentIndex`, `randomIndex`, `temp` |
| `h` | casa do personagem | `house` |
| `sp` | feitiço | `spell` |
| `pIdx`, `cIdx` | índice do personagem ativo | `playerIndex`, `cpuIndex` |

### 2. Números Mágicos

Valores literais sem contexto espalhados pelo código, extraídos para `constants.js`:

- Páginas da API: `8` (total de páginas), `100` (tamanho da página)
- Atributos de Poder por casa: Gryffindor `90`, Slytherin `85`, Hufflepuff `75`, Ravenclaw `80`, padrão `50`
- Atributos de Magia por espécie: human `70`, half-giant `88`, giant `95`, house elf `82`, ghost `60`, werewolf `91`, vampire `87`, centaur `78`, padrão `50`
- Atributos de Defesa por ancestralidade: pure-blood `90`, half-blood `75`, muggle-born `70`, muggle `40`, squib `35`, padrão `50`
- HP: base `80`, variação aleatória `20`
- Tamanhos: pack `4`, deck CPU `2`, feitiços do jogador `5`, feitiços disponíveis `20`
- Dano dos feitiços por categoria: Charm `45`, Curse `90`, Hex `65`, Jinx `55`, Spell `50`, Transfiguration `40`, Counter-spell `35`, Healing spell `-40`, padrão `30`
- Timeouts de animação: `800ms`, `700ms`, `600ms`, `500ms`, `400ms`

### 3. Código Duplicado (DRY)

- O bloco completo de fetch + filtragem + cálculo de atributos estava **idêntico** nas rotas `/api/pack` e `/api/cpu-deck`
- O algoritmo de embaralhamento (Fisher-Yates) estava **repetido 3 vezes**: em `/api/pack`, `/api/cpu-deck` e no JS do frontend (`loadGame`)
- Solução: extraídas as funções reutilizáveis `fetchCharacters`, `buildCard` e `shuffleArray`

### 4. Funções com Múltiplas Responsabilidades

- `/api/pack` e `/api/cpu-deck` faziam: busca na API + filtragem + cálculo de atributos + embaralhamento + resposta HTTP, tudo em uma única função
- `castSpell` no frontend: aplicava dano do jogador, executava turno da CPU, verificava mortes, atualizava UI e controlava animações com `setTimeout` aninhados
- Solução: separação em `services/potterApi.js`, `services/statsCalculator.js` e `routes/`

### 5. Code Smells Gerais

- `var` em todo o código → substituído por `const` e `let`
- `==` em comparações de strings → substituído por `===`
- Concatenação de strings com `+` → substituído por template literals
- Construção manual de HTML via concatenação de strings em `renderCard`, `renderDeckBadges` e `renderSpells`
- `console.log` para tratamento de erros → substituído por `console.error`

---

## Decisões de Refatoração

**Separação de ambientes no ESLint:** o `.eslintrc.json` inclui `"browser": true` além de `"node": true` porque o projeto possui JavaScript rodando tanto no servidor (Express) quanto no navegador (`public/index.html`). Sem essa configuração, o ESLint acusaria erro em variáveis globais do browser como `document`, `fetch` e `window`.

**Erro durante a renomeação de variáveis:** ao renomear `bar` e `msg` para `loadBar` e `loadMsg` na função `loadGame`, duas referências no final da função foram esquecidas e permaneceram com os nomes antigos. O jogo ficou travado na tela de carregamento com a mensagem "Preparando o adversário...". O erro foi identificado pelo console do navegador (`ReferenceError: bar is not defined`), que apontou exatamente a linha do problema. A correção foi simples — atualizar as duas referências restantes — mas o episódio reforça a importância de verificar o funcionamento da aplicação após cada etapa de refatoração, mesmo quando as mudanças parecem puramente mecânicas.

**Estrutura de arquivos adotada:**

```
wizard-duel/
├── index.js              ← apenas inicializa o servidor
├── constants.js          ← todas as constantes da aplicação
├── routes/
│   ├── characters.js     ← rota /api/pack
│   ├── spells.js         ← rota /api/spells
│   └── game.js           ← rota /api/cpu-deck
├── services/
│   ├── potterApi.js      ← comunicação com a PotterDB API
│   └── statsCalculator.js← cálculo de atributos e HP
└── public/
    ├── index.html
    ├── js/
    │   ├── game.js       ← lógica do jogo
    │   ├── render.js     ← funções de renderização
    │   └── api.js        ← chamadas ao back-end
    └── css/
        └── style.css     ← estilos extraídos do HTML
```

---

## Histórico de Commits

| Commit | Descrição |
|---|---|
| `chore: configure ESLint with Airbnb style guide` | Instalação do ESLint e configuração com guia Airbnb. Baseline: **465 problemas** (461 erros, 4 avisos) |
| `refactor: rename variables and functions` | Renomeação de todas as variáveis sem significado |
| `refactor: extract magic numbers to constants.js` | Criação do `constants.js` com todas as constantes |
| `refactor: eliminate duplicated code` | Extração de funções reutilizáveis (`shuffleArray`, `buildCard`, `fetchCharacters`) |
| `refactor: separate responsibilities` | Reorganização em `routes/`, `services/` e separação do frontend |
| `refactor: fix general code smells` | `var` → `const/let`, `===`, template literals, `console.error` |
