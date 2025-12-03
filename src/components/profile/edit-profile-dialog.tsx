// @/components/profile/edit-profile-dialog.tsx
"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import type { User, SpecialtyRate } from "@/lib/types"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  age: z.coerce.number().int().min(18, "Debes ser mayor de 18 años."),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface EditProfileDialogProps {
  user: User
  children: React.ReactNode
  onProfileUpdate: (updatedUser: Partial<User>) => void
}

export function EditProfileDialog({ user, children, onProfileUpdate }: EditProfileDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [specialtyRates, setSpecialtyRates] = React.useState<SpecialtyRate[]>([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      age: user.age,
      bio: user.bio || "",
    },
  })
  
  React.useEffect(() => {
    if (open) {
      reset({
        name: user.name,
        age: user.age,
        bio: user.bio || "",
      });

      // Initialize specialty rates
      if (user.isTutor) {
          if (user.specialtyRates && user.specialtyRates.length > 0) {
              setSpecialtyRates(user.specialtyRates);
          } else if (user.courses && user.courses.length > 0) {
              // Legacy fallback: create rates from courses using general hourlyRate
              setSpecialtyRates(
                  user.courses.map(course => ({ name: course, price: user.hourlyRate || 0 }))
              );
          }
      }
    }
  }, [user, open, reset]);

  const handlePriceChange = (specialtyName: string, newPrice: string) => {
      setSpecialtyRates(prev => prev.map(rate => 
          rate.name === specialtyName ? { ...rate, price: Number(newPrice) } : rate
      ));
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!auth.currentUser) return;
    setIsLoading(true)

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      
      const updatedData: Partial<User> = {
        name: data.name,
        age: data.age,
        bio: data.bio,
      };

      if (user.isTutor) {
          updatedData.specialtyRates = specialtyRates;
          // Update base hourlyRate to min of new rates for sorting/display consistency
          const prices = specialtyRates.map(r => r.price);
          if (prices.length > 0) {
              updatedData.hourlyRate = Math.min(...prices);
          }
      }

      // Update Auth Profile display name
      await updateProfile(auth.currentUser, {
        displayName: updatedData.name,
      });

      // Now, update Firestore with new data
      await updateDoc(userDocRef, updatedData);

      toast({
        title: "Perfil Actualizado",
        description: "Tu información ha sido guardada exitosamente.",
      });

      onProfileUpdate(updatedData); 
      setOpen(false);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y profesional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <div className="col-span-3">
                 <Input id="name" {...register("name")} />
                 {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Edad</Label>
               <div className="col-span-3">
                    <Input id="age" type="number" {...register("age")} />
                    {errors.age && <p className="text-destructive text-sm mt-1">{errors.age.message}</p>}
               </div>
            </div>
            
            {user.isTutor && (
                <>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="bio" className="text-right pt-2">Biografía</Label>
                        <div className="col-span-3">
                            <Textarea id="bio" {...register("bio")} placeholder="Cuéntanos sobre ti..." className="h-24" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t mt-2">
                        <Label className="font-semibold">Tarifas por Especialidad</Label>
                        <ScrollArea className="h-40 rounded-md border p-2">
                            <div className="space-y-3">
                                {specialtyRates.map((rate) => (
                                    <div key={rate.name} className="flex items-center justify-between gap-4 pr-2">
                                        <span className="text-sm font-medium flex-grow">{rate.name}</span>
                                        <div className="relative w-32 shrink-0">
                                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input 
                                                type="number" 
                                                className="h-8 pl-6 text-sm" 
                                                value={rate.price} 
                                                onChange={(e) => handlePriceChange(rate.name, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {specialtyRates.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No tienes especialidades asignadas.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
