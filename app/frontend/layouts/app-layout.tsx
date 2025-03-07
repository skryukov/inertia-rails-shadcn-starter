import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { useFlash } from "@/hooks/use-flash"
import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout"
import type { BreadcrumbItem } from "@/types"

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export default function AppLayout({
  children,
  breadcrumbs,
  ...props
}: AppLayoutProps) {
  useFlash()
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}
      <Toaster richColors />
    </AppLayoutTemplate>
  )
}
