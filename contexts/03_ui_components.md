# UI Components and Styling

The application uses [shadcn/ui](https://ui.shadcn.com) for components - a collection of reusable components built on Radix UI primitives and styled with Tailwind CSS.

## Component Library

All UI components are located in `app/frontend/components/ui/`. These are pre-styled, accessible components that follow the [shadcn/ui](https://ui.shadcn.com) pattern - they're not imported from a library but copied into your project so you can customize them.

### Core UI Components

Examples of available components:

- `Button` - Button component with variants
- `Card` - Card component for content containers
- `Input` - Input field component
- `Dialog` - Modal dialog component
- `Dropdown` - Dropdown menu component
- `Avatar` - Avatar component for user images/initials
- `Sidebar` - Navigation sidebar component
- `Form` - Form-related components

Example usage:

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={data.email}
    onChange={(e) => setData("email", e.target.value)}
  />
  <Button type="submit">Submit</Button>
</div>
```

## Application-Specific Components

The codebase also includes custom components for specific application needs:

### Layout Components

- `AppHeader` - Main navigation header
- `AppSidebar` - Main navigation sidebar
- `AppContent` - Main content container
- `AppShell` - Top-level layout wrapper

Example from `app/frontend/components/app-shell.tsx`:

```tsx
export function AppShell({ children, variant = "header" }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("sidebar") !== "false"
      : true,
  )

  const handleSidebarChange = (open: boolean) => {
    setIsOpen(open)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar", String(open))
    }
  }

  if (variant === "header") {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>
  }

  return (
    <SidebarProvider
      defaultOpen={isOpen}
      open={isOpen}
      onOpenChange={handleSidebarChange}
    >
      {children}
    </SidebarProvider>
  )
}
```

### User Interface Components

- `UserInfo` - User information display
- `UserMenuContent` - User dropdown menu content
- `AppLogoIcon` - Application logo icon
- `Breadcrumbs` - Breadcrumb navigation

Example from `app/frontend/components/breadcrumbs.tsx`:

```tsx
export function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbItemType[]
}) {
  return (
    <>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </>
  )
}
```

## Theme System

The application includes a light/dark theme system in `app/frontend/hooks/use-appearance.tsx`:

```tsx
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>("system")

  const updateAppearance = useCallback((mode: Appearance) => {
    setAppearance(mode)
    if (mode === "system") {
      localStorage.removeItem("appearance")
    } else {
      localStorage.setItem("appearance", mode)
    }
    applyTheme(mode)
  }, [])

  useEffect(() => {
    const savedAppearance = localStorage.getItem(
      "appearance",
    ) as Appearance | null
    updateAppearance(savedAppearance ?? "system")

    return () =>
      mediaQuery()?.removeEventListener("change", handleSystemThemeChange)
  }, [updateAppearance])

  return { appearance, updateAppearance }
}
```

Theme variables are defined in `app/frontend/entrypoints/application.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  /* More variables... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  /* More variables... */
}
```

## Form Components

The application includes a custom Form component in `app/frontend/components/form.tsx` that integrates with Inertia:

```tsx
function Form<TForm extends FormDataType = FormDataType>({
  form,
  children,
  onSubmit,
  ...props
}: FormProps<TForm>) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} {...props}>
      <FormContext.Provider value={{ form } as unknown as FormContextType}>
        {children}
      </FormContext.Provider>
    </form>
  )
}
```

Usage example:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/form"
import { useForm } from "@inertiajs/react"

const form = useForm({
  email: "",
  password: "",
})

<Form form={form} onSubmit={handleSubmit}>
  <FormField
    name="email"
    render={({ field, error }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} type="email" />
        </FormControl>
        <FormMessage>{error}</FormMessage>
      </FormItem>
    )}
  />
</Form>
```

## Flash Messages

Flash messages are displayed using the Sonner toast library, integrated via the `useFlash` hook:

```tsx
export const useFlash = () => {
  const { flash } = usePage<{ flash: Flash }>().props
  const [currentFlash, setCurrentFlash] = useState<Flash>(emptyFlash)

  useEffect(() => {
    setCurrentFlash(flash)
  }, [flash])

  router.on("start", () => {
    setCurrentFlash(emptyFlash)
  })

  useEffect(() => {
    if (currentFlash.alert) {
      toast.error(currentFlash.alert)
    }
    if (currentFlash.notice) {
      toast(currentFlash.notice)
    }
  }, [currentFlash])
}
```

## Tailwind CSS Integration

The application uses Tailwind CSS for styling, configured in `tailwind.config.js`. All components use Tailwind utility classes for styling.

Utility functions like `cn()` are provided for combining class names:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "text-foreground bg-background", 
  isActive && "font-bold",
  className
)}>
  {children}
</div>
```

## Responsive Design

The application includes responsive design patterns, with components adapting to different screen sizes:

```tsx
// Example of responsive classes
<div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
  <aside className="w-full max-w-xl lg:w-48">
    {/* Sidebar content */}
  </aside>

  <div className="flex-1 md:max-w-2xl">
    {/* Main content */}
  </div>
</div>
```

A `useMobile` hook is provided for programmatic responsive behavior:

```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```
