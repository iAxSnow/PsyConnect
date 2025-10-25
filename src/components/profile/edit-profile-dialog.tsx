// @/components/profile/edit-profile-dialog.tsx
"use client"

import * as React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { auth, db, storage } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  age: z.coerce.number().int().min(18, "Debes ser mayor de 18 años."),
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
  const [profilePic, setProfilePic] = React.useState<File | null>(null)
  const [profilePicName, setProfilePicName] = React.useState("")
  const profilePicInputRef = React.useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      age: user.age,
    },
  })

  React.useEffect(() => {
    if (user) {
        reset({
            name: user.name,
            age: user.age,
        });
    }
  }, [user, reset]);


  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicName(file.name)
      setProfilePic(file)
    }
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!auth.currentUser) return;
    setIsLoading(true)

    try {
      let imageUrl = user.imageUrl
      const updatedData: Partial<User> = {
        name: data.name,
        age: data.age,
      }
      
      // 1. Upload new profile picture if selected
      if (profilePic) {
        const profilePicRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`)
        const snapshot = await uploadBytes(profilePicRef, profilePic)
        imageUrl = await getDownloadURL(snapshot.ref)
      }
      
      updatedData.imageUrl = imageUrl;

      // 2. Update user profile in Auth
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: imageUrl,
      })

      // 3. Update user data in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userDocRef, updatedData)

      toast({
        title: "Perfil Actualizado",
        description: "Tu información ha sido guardada exitosamente.",
      })
      onProfileUpdate(updatedData); // Pass the correct updated data
      setProfilePic(null);
      setProfilePicName("");
      setOpen(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Realiza cambios en tu perfil. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <div className="col-span-3">
                 <Input id="name" {...register("name")} className="col-span-3" />
                 {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Edad</Label>
               <div className="col-span-3">
                    <Input id="age" type="number" {...register("age")} className="col-span-3" />
                    {errors.age && <p className="text-destructive text-sm mt-1">{errors.age.message}</p>}
               </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Foto</Label>
                <div className="col-span-3 flex items-center gap-2">
                    <Input id="profile-picture" type="file" className="hidden" ref={profilePicInputRef} onChange={handleProfilePicChange} accept="image/*" />
                    <Button type="button" size="sm" variant="outline" onClick={() => profilePicInputRef.current?.click()}> <Upload className="mr-2 h-4 w-4" /> Subir </Button>
                    {profilePicName && <span className="text-sm text-muted-foreground truncate max-w-28">{profilePicName}</span>}
                </div>
            </div>
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
