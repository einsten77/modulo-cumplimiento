import path from "path"
import { fileURLToPath } from "url"

/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  turbopack: {
    // Fuerza a que Turbopack use ESTA carpeta como raíz del proyecto,
    // evitando que tome D:\ por el pnpm-lock.yaml externo.
    root: __dirname,
  },

  // Evita el warning y futuros bloqueos por abrir desde IP en LAN (10.2.0.2)
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.2.0.2"],
}

export default nextConfig
