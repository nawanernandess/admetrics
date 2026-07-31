import { createContext, useContext } from 'react'

export const ModalCloseContext = createContext<() => void>(() => {})

/** Usado pelo conteúdo do modal (formulários) para fechar com a mesma animação de saída do X/Esc/backdrop. */
export function useRequestClose(): () => void {
  return useContext(ModalCloseContext)
}
