# AdMetrics

Site de monitoramento de métricas para produtos de marketing de afiliados: cadastro de produtos, lançamento diário de indicadores de campanha e dashboards com cálculos automáticos de performance.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Zustand-state-orange" alt="Zustand"/>
  <img src="https://img.shields.io/badge/Dexie-IndexedDB-ffcb05" alt="Dexie"/>
  <img src="https://img.shields.io/badge/Recharts-charts-8884d8" alt="Recharts"/>
  <img src="https://img.shields.io/badge/Zod-validation-3E67B1?logo=zod&logoColor=white" alt="Zod"/>
  <img src="https://img.shields.io/badge/Web_Crypto-AES--GCM-4CAF50" alt="Web Crypto API"/>
</p>

## Funcionalidades

- **Múltiplos produtos**: cadastro e alternância entre produtos monitorados, cada um com orçamento, estratégia de lance e metas próprias
- **Lançamento diário**: registro de impressões, cliques, visitantes, checkouts, conversões, custo e valor convertido por dia
- **Cálculos automáticos**: CTR, CPC médio, resultado (lucro/prejuízo), resultado acumulado de 7 dias, resultado acumulado total e taxa de fuga no funil
- **Dashboard**: cartões de KPIs, gráfico de resultado acumulado, funil de conversão, CTR x CPC, custo x receita e resultado diário
- **Tabela de registros**: histórico completo por produto, com edição inline de qualquer dia já lançado
- **Configurações do produto**: edição com autosave (orçamento diário, CPC/CPA máximo, valor de conversão, estratégia de lance, conta e página) e exclusão de produto
- **Autenticação com criptografia local**: o login deriva uma chave AES-GCM (via PBKDF2) que fica apenas em memória e criptografa/descriptografa os dados no IndexedDB de forma transparente
- **100% client-side**: sem backend — os dados vivem no IndexedDB do navegador via Dexie

## Como usar

Fase 1 é single-tenant — não há backend, contas reais nem cobrança. A tela de login existe apenas para demonstrar o fluxo e a derivação da chave de criptografia. Usuário único, hardcoded:

| E-mail | Senha |
|---|---|
| `demo@admetrics.app` | `demo1234` |

**Como funciona a criptografia:** a senha nunca é salva — ela é usada para derivar (via PBKDF2) uma chave AES-GCM que fica **apenas em memória**. Essa chave criptografa/descriptografa os dados no IndexedDB de forma transparente (a camada `lib/repo.ts` faz isso; a UI não sabe que existe criptografia). Consequência importante: **ao recarregar a página, a chave se perde e é preciso logar de novo** — isso é intencional, é o que torna a criptografia real (senão a chave teria que ficar salva em algum lugar acessível, o que anularia a proteção). Abrindo o DevTools → Application → IndexedDB → `admetrics`, os registros aparecem como blobs opacos (`iv` + `cipherText`), não como campos legíveis.

**Limite honesto:** isso protege contra inspeção casual do IndexedDB (o que motivou a decisão original). Não é segurança real contra alguém com acesso total ao runtime do navegador enquanto a sessão está aberta — não há como ter isso em uma SPA 100% client-side, sem servidor. Esse nível de proteção só faz sentido de verdade a partir da Fase 4 (backend + autenticação real).

## Estrutura do Projeto

```
src/
├── types/            # modelo de dados (Product, DailyRecord, ComputedRecord)
├── lib/
│   ├── repo.ts          # acesso a dados isolado da UI (Dexie + criptografia transparente)
│   ├── crypto.ts        # derivação de chave e criptografia/descriptografia AES-GCM
│   ├── authSession.ts   # sessão de autenticação
│   └── calculations.ts  # CTR, CPC médio, Resultado, Resultado 7d, Acumulado, Taxa de fuga
├── store/            # estado global (useAppStore para dados, useAuthStore para sessão)
└── components/
    ├── auth/         # tela de login
    ├── dashboard/    # KPIs e gráficos
    ├── records/      # tabela e formulário de registros diários
    ├── settings/     # edição e exclusão de produto
    ├── product/      # cadastro de novo produto
    ├── layout/       # sidebar e header
    └── common/       # componentes e estilos compartilhados
```

Identificadores de código (tipos, variáveis, funções, arquivos) são em inglês/camelCase. Textos visíveis na interface permanecem em português, que é o idioma do produto.

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [npm](https://npmjs.com) 10+

### Instalação

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

> Abre em `http://localhost:5173`

### Build de produção

```bash
npm run build
```

> Gera os arquivos em `dist/`

### Lint e formatação

```bash
npm run lint           # oxlint
npm run format         # aplica Prettier em todo o projeto
npm run format:check   # verifica formatação sem alterar arquivos
```
