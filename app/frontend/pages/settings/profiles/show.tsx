import { Transition } from "@headlessui/react"
import { Head, useForm, usePage } from "@inertiajs/react"
import { FormEventHandler } from "react"

import DeleteUser from "@/components/delete-user"
import HeadingSmall from "@/components/heading-small"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import SettingsLayout from "@/layouts/settings/layout"
import { settingsProfilePath } from "@/routes"
import { type BreadcrumbItem, type SharedData } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Profile settings",
    href: settingsProfilePath(),
  },
]

export default function Profile() {
  const { auth } = usePage<SharedData>().props

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      name: auth.user.name,
    })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    patch(settingsProfilePath(), {
      preserveScroll: true,
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Profile information"
            description="Update your name"
          />

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>

              <Input
                id="name"
                className="mt-1 block w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                autoComplete="name"
                placeholder="Full name"
              />

              <InputError className="mt-2" message={errors.name} />
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

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  )
}
