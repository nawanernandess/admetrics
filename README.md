# AdMetrics — Monitoramento de Produtos (MVP Fase 1)

Plataforma que substitui a planilha manual de acompanhamento de produtos de
marketing de afiliados. SPA 100% client-side (sem backend): cadastro de
produtos, registro diário, cálculos automáticos e dashboards.

## Stack

Vite + React + TypeScript · Tailwind CSS · Zustand · Dexie (IndexedDB) ·
Recharts · Zod · React Hook Form · Web Crypto API (AES-GCM + PBKDF2).

## Rodando localmente

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # build de produção em dist/
npm run lint
npm run format        # aplica Prettier em todo o projeto
npm run format:check  # verifica formatação sem alterar arquivos
```

## Login de teste (demonstração)

Fase 1 é single-tenant — não há backend, contas reais nem cobrança. A tela
de login existe apenas para demonstrar o fluxo e a derivação da chave de
criptografia. Usuário único, hardcoded:

```
E-mail: demo@admetrics.app
Senha:  demo1234
```

**Como funciona a criptografia:** a senha nunca é salva — ela é usada para
derivar (via PBKDF2) uma chave AES-GCM que fica **apenas em memória**. Essa
chave criptografa/descriptografa os dados no IndexedDB de forma transparente
(a camada `lib/repo.ts` faz isso; a UI não sabe que existe criptografia).
Consequência importante: **ao recarregar a página, a chave se perde e é
preciso logar de novo** — isso é intencional, é o que torna a criptografia
real (senão a chave teria que ficar salva em algum lugar acessível, o que
anularia a proteção). Abrindo o DevTools → Application → IndexedDB →
`admetrics`, os registros aparecem como blobs opacos (`iv` + `cipherText`),
não como campos legíveis.

**Limite honesto:** isso protege contra inspeção casual do IndexedDB (o que
motivou a pergunta original). Não é segurança real contra alguém com acesso
total ao runtime do navegador enquanto a sessão está aberta — não há como
ter isso em uma SPA 100% client-side, sem servidor. Esse nível de proteção
só faz sentido de verdade a partir da Fase 4 (backend + autenticação real).

## Estrutura

- `src/types` — modelo de dados (`Product`, `DailyRecord`).
- `src/lib/repo.ts` — camada de acesso a dados isolada da UI (Dexie +
  criptografia transparente; trocável por uma API REST na Fase 4 sem
  alterar componentes).
- `src/lib/crypto.ts` / `authSession.ts` — derivação de chave e
  criptografia/descriptografia AES-GCM.
- `src/lib/calculations.ts` — CTR, CPC médio, Resultado, Resultado 7d,
  Acumulado e Taxa de fuga.
- `src/store` — estado global (`useAppStore` para dados, `useAuthStore`
  para sessão).
- `src/components` — layout, auth, dashboard, records, settings e product.

Identificadores de código (tipos, variáveis, funções, arquivos) são em
inglês/camelCase. Textos visíveis na interface permanecem em português,
que é o idioma do produto.
