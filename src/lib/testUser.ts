/**
 * Fase 1 é single-tenant: um único usuário de teste, hardcoded, só para
 * demonstrar o fluxo de login e a derivação da chave de criptografia.
 * A senha em claro só existe aqui para ser exibida na tela de login como
 * atalho de teste — a comparação de fato usa o hash, nunca o valor puro.
 */
export const TEST_USER_EMAIL = 'demo@admetrics.app'
export const TEST_USER_PASSWORD = 'demo1234'
export const TEST_USER_PASSWORD_HASH =
  '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d'
