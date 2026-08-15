/** LOCKED FILE — Team 02 (Design System). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
