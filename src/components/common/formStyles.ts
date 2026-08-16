export const inputClass =
  'w-full rounded-lg border border-[var(--color-card-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20'

export const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]'

export const errorClass = 'mt-1 text-xs text-[var(--color-negative-text)]'

export const sectionTitleClass = 'mb-3 text-sm font-semibold text-[var(--color-text-primary)]'

const buttonBaseClass =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

export const buttonPrimaryClass = `${buttonBaseClass} bg-[var(--color-accent)] text-white hover:opacity-90`

export const buttonSecondaryClass = `${buttonBaseClass} font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)]`

export const buttonDangerClass = `${buttonBaseClass} bg-[var(--color-negative-base)] text-white hover:opacity-90`

export const buttonDangerGhostClass = `${buttonBaseClass} font-medium text-[var(--color-negative-text)] hover:bg-[var(--color-negative-bg)]`
