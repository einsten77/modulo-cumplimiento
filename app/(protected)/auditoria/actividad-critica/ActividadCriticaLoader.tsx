"use client"

import dynamic from "next/dynamic"

const ActividadCriticaClient = dynamic(() => import("./ActividadCriticaClient"), {
  ssr: false,
})

export default function ActividadCriticaLoader() {
  return <ActividadCriticaClient />
}
