/**
 * Controle de acesso baseado em perfis (Administrador, Gerente, Usuário).
 * Use com o objeto user do AuthContext.
 */

export type Role = 'admin' | 'gerente' | 'usuario'

export function canAccessSettings(role: string | undefined): boolean {
  return role === 'admin' || role === 'gerente'
}

export function canAccessUserManagement(role: string | undefined): boolean {
  return role === 'admin' || role === 'gerente'
}

export function canCreateEditDeleteUsers(role: string | undefined): boolean {
  return role === 'admin'
}

export function canViewUsers(role: string | undefined): boolean {
  return role === 'admin' || role === 'gerente'
}
