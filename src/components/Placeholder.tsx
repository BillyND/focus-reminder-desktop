interface PlaceholderProps {
  icon: string
  title: string
  message: string
}

export default function Placeholder({ icon, title, message }: PlaceholderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h2 className="text-xl font-semibold text-dark-text mb-2">
        {title}
      </h2>
      <p className="text-dark-muted">
        {message}
      </p>
    </div>
  )
}
