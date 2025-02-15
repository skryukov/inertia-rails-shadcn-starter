import { Transition } from "@headlessui/react"
import { Head, Link, useForm, usePage } from "@inertiajs/react"

import HeadingSmall from "@/components/heading-small"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { sessionPath, settingsSessionsPath } from "@/routes"
import { type BreadcrumbItem, type SharedData } from "@/types"

type Session = {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Sessions",
    href: settingsSessionsPath(),
  },
]

export default function Sessions({ sessions }: { sessions: Session[] }) {
  const { recentlySuccessful } = useForm()
  const { auth } = usePage<SharedData>().props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Sessions"
            description="Manage your active sessions across devices"
          />

          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.user_agent}
                      {session.id === auth.session.id && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      IP: {session.ip_address}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Active since:{" "}
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  {session.id !== auth.session.id && (
                    <Button variant="destructive" asChild>
                      <Link
                        method="delete"
                        href={sessionPath({ id: session.id })}
                        as="button"
                      >
                        Log out
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-neutral-600">Session terminated</p>
          </Transition>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
