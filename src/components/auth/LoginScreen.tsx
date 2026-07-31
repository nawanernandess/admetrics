import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '@/lib/testUser'
import { buttonPrimaryClass, labelClass } from '@/components/common/formStyles'

type AuthMode = 'login' | 'signup'

const SOCIAL_ICONS = ['github-icon', 'x-icon', 'discord-icon', 'bluesky-icon'] as const

const inputWithIconClass =
  'w-full rounded-lg border border-[var(--color-card-border)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20'

const fieldIconWrapperClass =
  'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary-3)]'

const noticeClass =
  'animate-fade-in rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]'

const errorNoticeClass =
  'animate-fade-in rounded-lg bg-[var(--color-negative-bg)] px-3 py-2 text-sm text-[var(--color-negative-text)]'

function UserFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 10a3.333 3.333 0 1 0 0-6.667A3.333 3.333 0 0 0 10 10Zm0 0c-3.222 0-5.833 1.94-5.833 4.333V15h11.666v-.667C15.833 11.94 13.222 10 10 10Z"
      />
    </svg>
  )
}

function MailFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.333 5.833h13.334c.46 0 .833.373.833.834v6.666c0 .46-.373.834-.833.834H3.333a.833.833 0 0 1-.833-.834V6.667c0-.46.373-.834.833-.834Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.333 6.667 6.25 4.583a.667.667 0 0 0 .834 0l6.25-4.583"
      />
    </svg>
  )
}

function LockFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <rect
        x="4.167"
        y="9.167"
        width="11.667"
        height="7.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M6.667 9.167V6.25a3.333 3.333 0 1 1 6.666 0v2.917"
      />
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h10.5M14.5 7 11.5 4M14.5 7l-3 3M16 13H5.5M5.5 13 8.5 16M5.5 13l3-3"
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
  const [notice, setNotice] = useState<string | null>(null)

  function toggleMode() {
    setNotice(null)
    setMode((current) => (current === 'login' ? 'signup' : 'login'))
  }

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault()
    await login(email, password)
  }

  function handleSignupSubmit(event: FormEvent) {
    event.preventDefault()
    setNotice('Cadastro ainda não disponível — Fase 1 é single-tenant, com usuário único de teste.')
  }

  function handleForgotPassword() {
    setNotice('Recuperação de senha estará disponível a partir da Fase 4 (backend real).')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="animate-fade-in-up grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-3xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-xl md:min-h-[560px] md:grid-cols-2">
        {/* Painel de identidade */}
        <div className="relative order-2 flex flex-col justify-between overflow-hidden p-8 text-white md:order-1">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(130% 140% at 0% 0%, var(--color-accent-deep) 0%, var(--color-accent) 55%, var(--color-accent-cyan) 130%)',
            }}
          />
          <div className="absolute -top-16 -left-14 h-56 w-56 rounded-full bg-[var(--color-accent-light)] opacity-25 blur-3xl" />
          <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-[var(--color-accent-cyan)] opacity-30 blur-3xl" />
          <img
            src="/favicon.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-12 h-64 w-64 rotate-12 opacity-20"
          />

          <div className="relative">
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              Bem-vindo
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {mode === 'login' ? 'Novo Login' : 'Inscreva-se'}
            </h1>
            <p className="mt-2 max-w-[240px] text-sm text-white/80">
              {mode === 'login'
                ? 'Acesse sua conta para acompanhar seus produtos.'
                : 'Crie uma conta para começar a monitorar seus produtos.'}
            </p>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMode}
              aria-label="Alternar entre login e cadastro"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors duration-150 hover:bg-white/25"
            >
              <SwapIcon />
            </button>
            <button
              type="button"
              onClick={toggleMode}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10"
            >
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>

          <div className="relative flex items-center gap-3 text-white/70">
            {SOCIAL_ICONS.map((icon) => (
              <svg key={icon} viewBox="0 0 20 20" className="h-4 w-4 fill-current opacity-80">
                <use href={`/icons.svg#${icon}`} />
              </svg>
            ))}
          </div>
        </div>

        {/* Painel de formulário */}
        <div className="order-1 flex flex-col justify-center p-8 md:order-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {mode === 'login' ? 'Faça login' : 'Cadastre-se'}
            </h2>
            <span className="rounded-full bg-[var(--color-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
              {mode === 'login' ? 'Login' : 'Cadastro'}
            </span>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <span className={fieldIconWrapperClass}>
                    <MailFieldIcon />
                  </span>
                  <input
                    type="email"
                    className={inputWithIconClass}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Senha</label>
                <div className="relative">
                  <span className={fieldIconWrapperClass}>
                    <LockFieldIcon />
                  </span>
                  <input
                    type="password"
                    className={inputWithIconClass}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <input
                    type="checkbox"
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
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Usuário</label>
                <div className="relative">
                  <span className={fieldIconWrapperClass}>
                    <UserFieldIcon />
                  </span>
                  <input type="text" className={inputWithIconClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <span className={fieldIconWrapperClass}>
                    <MailFieldIcon />
                  </span>
                  <input type="email" className={inputWithIconClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Senha</label>
                <div className="relative">
                  <span className={fieldIconWrapperClass}>
                    <LockFieldIcon />
                  </span>
                  <input type="password" className={inputWithIconClass} />
                </div>
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
                Entrar
              </button>
            </form>
          )}

          {mode === 'login' ? (
            <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
              <p className="font-medium text-[var(--color-text-primary)]">Usuário de teste</p>
              <p className="mt-0.5 font-tabular">
                {TEST_USER_EMAIL} · {TEST_USER_PASSWORD}
              </p>
            </div>
          ) : null}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-text-secondary-3)]">
            A senha deriva a chave que criptografa seus dados no navegador — ao recarregar a página,
            é preciso logar de novo.
          </p>
        </div>
      </div>
    </div>
  )
}
