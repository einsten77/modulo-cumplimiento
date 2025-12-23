export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
