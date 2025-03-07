import { Transition } from "@headlessui/react"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { type FormEventHandler, useRef } from "react"

import HeadingSmall from "@/components/heading-small"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { identityEmailVerificationPath, settingsEmailPath } from "@/routes"
import type { BreadcrumbItem, SharedData } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Email settings",
    href: settingsEmailPath(),
  },
]

export default function Email({ status }: { status?: string }) {
  const currentPasswordInput = useRef<HTMLInputElement>(null)

  const { auth } = usePage<SharedData>().props
  const {
    data,
    setData,
    patch,
    errors,
    reset,
    processing,
    recentlySuccessful,
  } = useForm({
    password_challenge: "",
    email: auth.user.email,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    patch(settingsEmailPath(), {
      preserveScroll: true,
      onSuccess: () => reset("password_challenge"),
      onError: (errors) => {
        if (errors.password_challenge) {
          reset("password_challenge")
          currentPasswordInput.current?.focus()
        }
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Update email"
            description="Update your email address and verify it"
          />

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                required
                autoComplete="username"
                placeholder="Email address"
              />

              <InputError className="mt-2" message={errors.email} />
            </div>

            {!auth.user.verified && (
              <div>
                <p className="text-muted-foreground -mt-4 text-sm">
                  Your email address is unverified.{" "}
                  <Link
                    href={identityEmailVerificationPath()}
                    method="post"
                    as="button"
                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                  >
                    Click here to resend the verification email.
                  </Link>
                </p>

                {status === "verification-link-sent" && (
                  <div className="mt-2 text-sm font-medium text-green-600">
                    A new verification link has been sent to your email address.
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password_challenge">Current password</Label>

              <Input
                id="password_challenge"
                ref={currentPasswordInput}
                value={data.password_challenge}
                onChange={(e) => setData("password_challenge", e.target.value)}
                type="password"
                className="mt-1 block w-full"
                autoComplete="current-password"
                placeholder="Current password"
              />

              <InputError message={errors.password_challenge} />
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={processing}>Save</Button>

              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-neutral-600">Saved</p>
              </Transition>
            </div>
          </form>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
