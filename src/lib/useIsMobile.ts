import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 639px)'

/** Mesmo breakpoint usado pelas classes `sm:hidden`/`sm:flex` do layout (Tailwind `sm` = 640px). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mediaQuery.matches)
    onChange()
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
