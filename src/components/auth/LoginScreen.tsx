import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '@/lib/testUser'
import { buttonPrimaryClass, inputClass, labelClass } from '@/components/common/formStyles'

export function LoginScreen() {
  const login = useAuthStore((state) => state.login)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const error = useAuthStore((state) => state.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await login(email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="animate-fade-in-up w-full max-w-sm rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-bold text-white">
            A
          </span>
          <span className="text-lg font-bold text-[var(--color-text-primary)]">AdMetrics</span>
        </div>

        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">Entrar</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Acesse com o usuário de teste para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className={labelClass}>Senha</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="animate-fade-in rounded-lg bg-[var(--color-negative-bg)] px-3 py-2 text-sm text-[var(--color-negative-text)]">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting} className={`w-full ${buttonPrimaryClass}`}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
          <p className="font-medium text-[var(--color-text-primary)]">Usuário de teste</p>
          <p className="mt-0.5 font-tabular">
            {TEST_USER_EMAIL} · {TEST_USER_PASSWORD}
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-text-secondary-3)]">
          A senha deriva a chave que criptografa seus dados no navegador — ao recarregar a página, é
          preciso logar de novo.
        </p>
      </div>
    </div>
  )
}
