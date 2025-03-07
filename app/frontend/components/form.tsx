import type { FormDataConvertible } from "@inertiajs/core"
import type { InertiaFormProps } from "@inertiajs/react"
import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormDataType = Record<string, FormDataConvertible>

interface FormContextType<TForm extends FormDataType = FormDataType> {
  form?: InertiaFormProps<TForm>
}

const FormContext = React.createContext<FormContextType>({} as FormContextType)

type FormProps<TForm extends FormDataType = FormDataType> =
  React.PropsWithChildren<
    React.HTMLAttributes<HTMLFormElement> & {
      form: InertiaFormProps<TForm>
      onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    }
  >

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

interface FormFieldContextType<
  TForm extends FormDataType = FormDataType,
  TName extends keyof TForm = keyof TForm,
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextType>(
  {} as FormFieldContextType,
)

const FormField = <
  TForm extends FormDataType = FormDataType,
  TName extends keyof TForm = keyof TForm,
>({
  name,
  render,
}: {
  name: TName
  render: (props: {
    error: string | undefined
    field: {
      id: string
      name: string
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
      onKeyPress: () => void
      value: FormDataConvertible
    }
  }) => React.ReactNode
}) => {
  const { form } = React.useContext(FormContext)

  if (!form) {
    throw new Error("FormField should be used within <Form>")
  }

  return (
    <FormFieldContext.Provider value={{ name: String(name) }}>
      <Renderer render={render} />
    </FormFieldContext.Provider>
  )
}

interface FieldProps {
  id: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress: () => void
  value: FormDataConvertible
}

const Renderer = ({
  render,
}: {
  render: (props: {
    error: string | undefined
    field: FieldProps
  }) => React.ReactNode
}) => {
  const { id, name, form } = useFormField()

  const fieldValue = name in form.data ? form.data[name] : undefined

  return render({
    error: form.errors[name],
    field: {
      id,
      name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        form.setData(name, e.target.value as FormDataConvertible),
      onKeyPress: () => {
        if (form.errors[name]) {
          form.clearErrors(name)
        }
      },
      value: fieldValue,
    },
  })
}

const useFormField = () => {
  const { form } = React.useContext(FormContext)
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  if (!form) {
    throw new Error("useFormField should be used within <Form>")
  }

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: form.errors[fieldContext.name],
    form,
  }
}

interface FormItemContextValue {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ?? props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
