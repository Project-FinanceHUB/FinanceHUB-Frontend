export type UserRole = 'admin' | 'gerente' | 'usuario'

export type User = {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  ultimoLogin?: string
  /** IDs das empresas às quais o usuário está vinculado (Gerente/Usuário). */
  companyIds?: string[]
}

export type UserFormData = Omit<User, 'id' | 'ultimoLogin'> & { password?: string }

export type Profile = {
  nome: string
  email: string
  telefone: string
  cargo: string
}

export type Preferences = {
  tema: 'claro' | 'escuro' | 'sistema'
  idioma: string
  notificacoesEmail: boolean
  notificacoesPush: boolean
}

export type Security = {
  senhaAtual?: string
  novaSenha?: string
  confirmarSenha?: string
  doisFatores: boolean
}

export type Permission = {
  id: string
  chave: string
  descricao: string
  ativo: boolean
}

export type PermissionFormData = Omit<Permission, 'id'>
