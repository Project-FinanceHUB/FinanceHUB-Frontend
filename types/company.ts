export type Company = {
  id: string
  nome: string
  cnpjs: string[]
  ativo?: boolean
}

export type CompanyFormData = Omit<Company, 'id'>

