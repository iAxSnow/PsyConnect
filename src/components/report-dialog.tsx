// @/components/report-dialog.tsx
"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { db, auth } from "@/lib/firebase"
import type { User } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

const reportSchema = z.object({
  reason: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(500, "La descripción no puede exceder los 500 caracteres."),
})

type ReportFormValues = z.infer<typeof reportSchema>

interface ReportDialogProps {
  reportedUser: User;
  reporterUser: User;
  children: React.ReactNode;
}

export function ReportDialog({ reportedUser, reporterUser, children }: ReportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  })

  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    if (!auth.currentUser) {
        toast({ title: "Error", description: "Debes iniciar sesión para reportar.", variant: "destructive" });
        return;
    };
    setIsLoading(true)

    try {
      await addDoc(collection(db, "reports"), {
        reportedUserId: reportedUser.uid,
        reportedUserName: reportedUser.name,
        reportedByUserId: reporterUser.uid,
        reportedByUserName: reporterUser.name,
        reason: data.reason,
        status: "Pendiente",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Reporte Enviado",
        description: "Gracias. Hemos recibido tu reporte y lo revisaremos pronto.",
      })
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error sending report:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar tu reporte. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar a {reportedUser.name}</DialogTitle>
          <DialogDescription>
            Describe el problema que tuviste. Tu reporte será revisado por un administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="reason">Motivo del reporte</Label>
                <Textarea 
                    id="reason" 
                    placeholder="Ej: Comportamiento inapropiado durante la sesión..." 
                    {...register("reason")}
                    rows={5}
                />
                 {errors.reason && <p className="text-destructive text-sm mt-1">{errors.reason.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              <AlertCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Enviando..." : "Enviar Reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
