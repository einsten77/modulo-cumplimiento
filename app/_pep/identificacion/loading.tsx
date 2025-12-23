export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
        <div className="h-4 w-4 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
        <div className="h-4 w-4 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  )
}
