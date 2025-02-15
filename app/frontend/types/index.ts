import { LucideIcon } from "lucide-react"

export type Auth = {
  user: User
  session: {
    id: string
  }
}

export type BreadcrumbItem = {
  title: string
  href: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon | null
  isActive?: boolean
}

export type Flash = {
  alert?: string
  notice?: string
}

export type SharedData = {
  auth: Auth
  flash: Flash
  [key: string]: unknown
}

export type User = {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown // This allows for additional properties...
}
