import { Toaster } from "@/components/ui/sonner"
import { useFlash } from "@/hooks/use-flash"
import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout"

export default function AuthLayout({
  children,
  title,
  description,
  ...props
}: {
  children: React.ReactNode
  title: string
  description: string
}) {
  useFlash()
  return (
    <AuthLayoutTemplate title={title} description={description} {...props}>
      {children}
      <Toaster richColors />
    </AuthLayoutTemplate>
  )
}
