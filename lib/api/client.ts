interface ApiConfig {
  baseURL: string
  timeout?: number
}

interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout || 30000
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sagra_token")
    }
    return null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken()
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      ;(headers as any).Authorization = `Bearer ${token}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // intentamos leer JSON, pero si el backend devuelve HTML/texto, no explotamos
        let payload: any = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }

        const message =
          payload?.message ||
          payload?.error ||
          `Error en la solicitud (${response.status})`

        const err: ApiError = {
          message,
          status: response.status,
          errors: payload?.errors,
        }

        throw err
      }

      return response.json()
    } catch (error) {
      console.error("[v0] API request error:", error)
      throw error
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient({
  // Evita que una variable placeholder en Amplify (ej: backend-placeholder.local)
  // rompa toda la app con ERR_NAME_NOT_RESOLVED.
  //
  // - Si la env viene vacía o con placeholder → en PROD usamos same-origin ("")
  //   para que al menos no falle por DNS y puedas usar rewrites/proxy.
  // - En DEV caemos a localhost:8080.
  baseURL: (() => {
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || ""
    const url = raw.trim().replace(/\/$/, "")
    const isProd = process.env.NODE_ENV === "production"

    const devFallback = "http://localhost:8080"

    if (!url) return isProd ? "" : devFallback
    if (url.includes("backend-placeholder")) return isProd ? "" : devFallback
    if (url.includes("placeholder.local")) return isProd ? "" : devFallback

    return url
  })(),
})
