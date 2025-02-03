import { ThemeProvider } from "@/components/theme-provider"
import { ReactNode } from "react"

function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  )
}

export default Layout
