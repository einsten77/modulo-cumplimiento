export type RoleType =
  | "OFICIAL_CUMPLIMIENTO"
  | "USUARIO_RRHH"
  | "USUARIO_COMERCIAL"
  | "CONSULTOR"
  | "AUDITOR_INTERNO"
  | "REGULADOR_SUDEASEG"

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: RoleType
  permissions: string[]
  department?: string
  avatarUrl?: string
  createdAt: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: User
  }
  message?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
