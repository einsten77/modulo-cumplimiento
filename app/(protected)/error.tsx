"use client"

import { useEffect } from "react"

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Protected Error Boundary]", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold text-red-600">
        Ocurrió un error inesperado
      </h1>

      <p className="max-w-md text-center text-sm text-muted-foreground">
        La aplicación encontró un problema al cargar esta sección.
        El error ha sido registrado.
      </p>

      <pre className="max-w-2xl overflow-auto rounded-md bg-gray-100 p-4 text-xs text-gray-800">
        {error.message}
      </pre>

      <button
        onClick={() => reset()}
        className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
      >
        Reintentar
      </button>
    </div>
  )
}
