import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '@/lib/testUser'
import { buttonPrimaryClass } from '@/components/common/formStyles'
import { BrandMark } from '@/components/common/BrandMark'
import { ThemeToggle } from '@/components/common/ThemeToggle'

type AuthMode = 'login' | 'signup'

const fieldLabelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]'

const fieldInputClass =
  'w-full rounded-lg border border-[var(--color-card-border)] bg-[var(--color-input-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary-3)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20'

const noticeClass =
  'animate-fade-in rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]'

const errorNoticeClass =
  'animate-fade-in rounded-lg bg-[var(--color-negative-bg)] px-3 py-2 text-sm text-[var(--color-negative-text)]'

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.667 10H3.333M3.333 10 9 15.667M3.333 10 9 4.333"
      />
    </svg>
  )
}

export function LoginScreen() {
  const login = useAuthStore((state) => state.login)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const error = useAuthStore((state) => state.error)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  function toggleMode() {
    setNotice(null)
    setMode((current) => (current === 'login' ? 'signup' : 'login'))
  }

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault()
    await login(email, password, remember)
  }

  function handleSignupSubmit(event: FormEvent) {
    event.preventDefault()
    setNotice('Cadastro ainda não disponível — Fase 1 é single-tenant, com usuário único de teste.')
  }

  function handleForgotPassword() {
    setNotice('Recuperação de senha estará disponível a partir da Fase 4 (backend real).')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="h-1 shrink-0 bg-[var(--color-accent)]" />

      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-6 sm:px-10">
        <span className="text-lg font-bold">
          <span className="text-[var(--color-accent)]">Ad</span>
          <span className="text-[var(--color-text-primary)]">Metrics</span>
        </span>
        <ThemeToggle className="text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)]" />
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 sm:flex-1 sm:content-center sm:px-10 sm:py-10 sm:pb-10 lg:grid-cols-2 lg:gap-16">
        {/* Painel promocional — só conteúdo de marca, sem nenhum controle
            interativo. Escondido no mobile para não gerar scroll extra na
            tela de login, aparece só a partir do breakpoint lg (desktop). */}
        <div className="relative order-2 hidden overflow-hidden rounded-3xl bg-[#0d0d10] p-8 sm:p-10 lg:order-1 lg:block">
          <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[var(--color-accent)] opacity-30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[var(--color-accent-cyan)] opacity-20 blur-3xl" />

          <div className="relative flex h-48 items-center justify-center sm:h-56">
            <div className="flex h-32 w-52 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-deep)] shadow-xl">
              <BrandMark className="h-16 w-16 text-white/90" />
            </div>
          </div>

          <div className="relative mt-8">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Acompanhe seus produtos em um único painel
            </h2>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Impressões, cliques, conversões e resultado — tudo calculado automaticamente a partir
              dos seus registros diários, com os dados sempre no seu navegador.
            </p>
          </div>
        </div>

        {/* Formulário — direto na página, sem card/borda ao redor. */}
        <div className="order-1 mx-auto w-full max-w-sm py-6 lg:order-2 lg:py-0">
          {mode === 'login' ? (
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Olá, seja bem-vindo!
            </h1>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMode}
                aria-label="Voltar para o login"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg)]"
              >
                <ArrowLeftIcon />
              </button>
              <h1 className="flex-1 text-center text-xs font-bold text-[var(--color-text-primary)]">
                Criar conta
              </h1>
              <span className="h-8 w-8 shrink-0" aria-hidden="true" />
            </div>
          )}
          <p
            className={
              mode === 'login'
                ? 'mt-3 text-sm text-[var(--color-text-secondary)]'
                : 'mt-3 text-3xl font-bold text-[var(--color-text-primary)]'
            }
          >
            {mode === 'login'
              ? 'Digite seu e-mail e senha para acessar seus produtos.'
              : 'Crie sua conta e comece a monitorar seus produtos.'}
          </p>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
              <div>
                <label className={fieldLabelClass}>E-mail</label>
                <input
                  type="email"
                  className={fieldInputClass}
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className={fieldLabelClass}>Senha</label>
                <input
                  type="password"
                  className={fieldInputClass}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[var(--color-card-border)] accent-[var(--color-accent)]"
                  />
                  Lembrar
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-[var(--color-accent)] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {remember ? (
                <p className={noticeClass}>
                  Seu login ficará salvo neste navegador por 7 dias.
                </p>
              ) : null}

              {error ? <p className={errorNoticeClass}>{error}</p> : null}
              {notice ? <p className={noticeClass}>{notice}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${buttonPrimaryClass}`}
              >
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="mt-8 space-y-4">
              <div>
                <label className={fieldLabelClass}>Usuário</label>
                <input type="text" className={fieldInputClass} placeholder="Seu nome" />
              </div>
              <div>
                <label className={fieldLabelClass}>E-mail</label>
                <input type="email" className={fieldInputClass} placeholder="Digite seu email" />
              </div>
              <div>
                <label className={fieldLabelClass}>Senha</label>
                <input type="password" className={fieldInputClass} placeholder="Crie uma senha" />
              </div>

              <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[var(--color-card-border)] accent-[var(--color-accent)]"
                />
                Lembrar de mim
              </label>

              {notice ? <p className={noticeClass}>{notice}</p> : null}

              <button type="submit" className={`w-full ${buttonPrimaryClass}`}>
                Criar conta
              </button>
            </form>
          )}

          {mode === 'login' ? (
            <div className="mt-5 rounded-lg bg-[var(--color-hover-bg)] px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
              <p className="font-medium text-[var(--color-text-primary)]">Usuário de teste</p>
              <p className="mt-0.5 font-tabular">
                {TEST_USER_EMAIL} · {TEST_USER_PASSWORD}
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-[var(--color-text-secondary)]">
            {mode === 'login' ? 'Ainda não tem uma conta? ' : 'Já tem uma conta? '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-[var(--color-accent)] hover:underline"
            >
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </p>

          <p className="mt-4 text-[11px] leading-relaxed text-[var(--color-text-secondary-3)]">
            A senha deriva a chave que criptografa seus dados no navegador — ao recarregar a página,
            é preciso logar de novo.
          </p>
        </div>
      </div>
    </div>
  )
}
