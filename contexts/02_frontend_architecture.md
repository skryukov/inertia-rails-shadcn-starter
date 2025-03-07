# Frontend Architecture

The frontend architecture uses React with TypeScript, connected to Rails via Inertia.js. This approach provides the developer experience of a SPA while leveraging Rails server-side routing.

## Inertia.js Integration

Inertia.js serves as a thin client-side layer that connects the Rails backend with the React frontend. It replaces the traditional page reloads with client-side navigation while keeping the server-side routing logic.

Main entry point (`app/frontend/entrypoints/inertia.ts`):

```typescript
import { createInertiaApp } from "@inertiajs/react"
import { ReactNode, createElement } from "react"
import { createRoot } from "react-dom/client"

import { initializeTheme } from "@/hooks/use-appearance"

// Temporary type definition, until @inertiajs/react provides one
type ResolvedComponent = {
  default: ReactNode & { layout?: (page: ReactNode) => ReactNode }
  layout?: (page: ReactNode) => ReactNode
}

const appName = (import.meta.env.VITE_APP_NAME || "Rails") as string

void createInertiaApp({
  // Set default page title
  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>("../pages/**/*.tsx", {
      eager: true,
    })
    const page = pages[`../pages/${name}.tsx`]
    if (!page) {
      console.error(`Missing Inertia page component: '${name}.tsx'`)
    }
    return page
  },

  setup({ el, App, props }) {
    if (el) {
      // Uncomment for SSR hydration:
      // if (el.hasChildNodes()) {
      //   hydrateRoot(el, createElement(App, props))
      //   return
      // }
      createRoot(el).render(createElement(App, props))
    }
  },

  progress: {
    color: "#4B5563",
  },
})

// Initialize theme on load
initializeTheme()
```

## Page Structure

Inertia pages are React components that correspond to routes defined in Rails. When a route is requested, the controller renders the corresponding page component.

Pages are located in `app/frontend/pages/` and are organized by feature/section.

Example page component (`app/frontend/pages/dashboard/index.tsx`):

```tsx
import { Head } from "@inertiajs/react"
import { PlaceholderPattern } from "@/components/placeholder-pattern"
import AppLayout from "@/layouts/app-layout"
import { dashboardPath } from "@/routes"
import { type BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboardPath(),
  },
]

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Dashboard content */}
      </div>
    </AppLayout>
  )
}
```

## Layout Components

The application uses layout components to maintain consistent UI across pages:

- `AppLayout` - Main layout for authenticated pages
- `AuthLayout` - Layout for authentication pages (login, signup, etc.)
- `SettingsLayout` - Specialized layout for settings pages

These layouts are used by wrapping the page content:

```tsx
<AppLayout breadcrumbs={breadcrumbs}>
  <Head title="Dashboard" />
  {/* Page content */}
</AppLayout>
```

## Routing Integration

Rails routes are exposed to JavaScript using the js-routes gem. This allows you to use the same route helpers in both Ruby and JavaScript:

```tsx
import { Link } from "@inertiajs/react"
import { dashboardPath, signInPath } from "@/routes"

// Then use them like
<Link href={dashboardPath()}>Dashboard</Link>
<Link href={signInPath()}>Sign In</Link>
```

## Form Handling

Inertia.js provides a form helper for handling form submissions:

```tsx
import { useForm } from "@inertiajs/react"

// In your component
const { data, setData, post, processing, errors } = useForm({
  email: "",
  password: "",
})

const submit = (e) => {
  e.preventDefault()
  post(signInPath())
}

// In the JSX
<form onSubmit={submit}>
  <Input
    type="email"
    value={data.email}
    onChange={e => setData("email", e.target.value)}
  />
  {errors.email && <InputError message={errors.email} />}
  <Button type="submit" disabled={processing}>Sign In</Button>
</form>
```

## Shared Data

Data shared from the server to all pages is available via the `usePage` hook:

```tsx
import { usePage } from "@inertiajs/react"
import { type SharedData } from "@/types"

function MyComponent() {
  const { auth } = usePage<SharedData>().props
  const { user } = auth
  
  return <div>Hello, {user.name}</div>
}
```

The shared data structure is defined in `app/frontend/types/index.ts`.

## Custom Hooks

Several custom hooks are available:

- `useAppearance` - For managing light/dark mode
- `useFlash` - For accessing flash messages
- `useInitials` - Helper for generating initials from a name
- `useMobile` - Detects if the device is mobile
- `useMobileNavigation` - Mobile navigation helpers

Example usage:

```tsx
import { useAppearance } from "@/hooks/use-appearance"

function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance()
  
  return (
    <Button onClick={() => updateAppearance(appearance === "dark" ? "light" : "dark")}>
      Toggle Theme
    </Button>
  )
}
```

## TypeScript Integration

The application uses TypeScript for type safety. Key types are defined in `app/frontend/types/`:

```typescript
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

export type User = {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown
}
```

## Asset Management

Vite is used for frontend asset management. The configuration is in `vite.config.ts`:

```typescript
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    RubyPlugin(),
  ],
})
```

## Server-Side Rendering (Optional)

The application includes optional SSR support, which can be enabled by:

1. Uncommenting SSR code in `app/frontend/entrypoints/inertia.ts`
2. Updating configuration in `config/deploy.yml`

The SSR implementation is in `app/frontend/ssr/ssr.ts`.
