import Image from "next/image"

interface OccidentalLogoProps {
  variant?: "full" | "icon"
  className?: string
}

export function OccidentalLogo({ variant = "full", className = "" }: OccidentalLogoProps) {
  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 bg-[#00bf63] rounded-full flex items-center justify-center">
            <div className="w-7 h-7 bg-white rounded-l-full rounded-r-none" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#fce809] rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <Image
      src="/images/logo-2.png"
      alt="Seguros La Occidental"
      width={200}
      height={40}
      className={className}
      priority
    />
  )
}
