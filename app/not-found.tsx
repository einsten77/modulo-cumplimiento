export default function NotFound() {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui", padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Página no encontrada</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>
          La ruta solicitada no existe o no tienes acceso.
        </p>
        <a href="/login">Ir a iniciar sesión</a>
      </body>
    </html>
  )
}
