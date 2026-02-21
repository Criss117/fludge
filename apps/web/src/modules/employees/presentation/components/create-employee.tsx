import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";
import { Button } from "@/modules/shared/components/ui/button";
import { useAuthForm } from "@/modules/auth/presentation/components/auth-form";
import { FieldGroup } from "@/modules/shared/components/ui/field";
import {
  signUpUsernameSchema,
  type SignUpUsernameSchema,
} from "@fludge/utils/validators/auth.schemas";
import { useMutateEmployees } from "@/modules/employees/application/hooks/use-mutate-employees";

const defaultValues: SignUpUsernameSchema = {
  address: "",
  email: "",
  name: "",
  username: "",
  password: Math.random().toString(36).substring(2, 15),
  cc: "",
  phone: "",
};

export function CreateEmployee() {
  const [open, setOpen] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const { create } = useMutateEmployees();

  const form = useAuthForm({
    defaultValues,
    validators: {
      onChange: signUpUsernameSchema,
    },
    onSubmit: ({ value, formApi }) => {
      setRootError(null);
      const toastLoadingId = toast.loading("Registrando empleado...", {
        position: "top-center",
      });
      create.mutate(value, {
        onSuccess: () => {
          toast.dismiss(toastLoadingId);
          toast.success("Empleado registrado exitosamente", {
            position: "top-center",
          });
          formApi.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.dismiss(toastLoadingId);
          toast.error(error.message, {
            position: "top-center",
          });
          setRootError(error.message);
        },
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setRootError("");
          form.reset();
        }

        setOpen(v);
      }}
    >
      <DialogTrigger render={(props) => <Button {...props} />}>
        <UserPlus />
        <span>Registrar Nuevo Empleado</span>
      </DialogTrigger>
      <DialogContent className="min-w-3/5">
        <DialogHeader>
          <DialogTitle>Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Completa los campos para crear un nuevo empleado.
          </DialogDescription>
        </DialogHeader>
        {rootError && <div className="text-red-500">{rootError}</div>}
        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField
            name="name"
            children={(field) => <field.NameField />}
          />
          <FieldGroup className="flex-row gap-4 items-start">
            <form.AppField
              name="username"
              children={(field) => <field.UsernameField />}
            />
            <form.AppField
              name="email"
              children={(field) => <field.EmailField />}
            />
          </FieldGroup>
          <form.AppField
            name="address"
            children={(field) => <field.AddressField />}
          />
          <FieldGroup className="flex-row gap-4 items-start">
            <form.AppField name="cc" children={(field) => <field.CCField />} />
            <form.AppField
              name="phone"
              children={(field) => <field.PhoneField />}
            />
          </FieldGroup>
          <form.AppField
            name="password"
            children={(field) => <field.PasswordField hideForgotPassword />}
          />

          <DialogFooter>
            <DialogClose
              render={(props) => <Button variant="outline" {...props} />}
            >
              Cancelar
            </DialogClose>
            <Button type="submit">Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
