import { Pencil } from "lucide-react";
import { Button } from "@/core/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/components/ui/dialog";
import type { GroupDetail } from "@repo/core/entities/group";
import { UpdateGroupForm } from "./update-group-form";
import { useState } from "react";

interface Props {
  group: GroupDetail;
  businessId: string;
}

export function UpdateGroupDialog({ group, businessId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <UpdateGroupForm.Root
          group={group}
          businessId={businessId}
          options={{
            onSuccess: () => setIsOpen(false),
          }}
        >
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle>Editar grupo</DialogTitle>
              <DialogDescription>
                Aquí podrás editar el nombre o descripción
              </DialogDescription>
            </DialogHeader>
            <fieldset className="space-y-2">
              <UpdateGroupForm.Name />
              <UpdateGroupForm.Description className="resize-none" />
            </fieldset>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="destructive">Cancelar</Button>
              </DialogClose>
              <UpdateGroupForm.Submit />
            </DialogFooter>
          </div>
        </UpdateGroupForm.Root>
      </DialogContent>
    </Dialog>
  );
}
