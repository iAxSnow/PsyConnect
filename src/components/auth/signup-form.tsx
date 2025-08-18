// @/components/auth/signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Upload } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth, db, storage } from "@/lib/firebase"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [profilePic, setProfilePic] = React.useState<File | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [fileName, setFileName] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setProfilePic(file)
    }
  }
  
  const handleFileClick = () => {
    fileInputRef.current?.click();
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profilePic) {
      toast({ title: "Error", description: "Por favor, sube una foto de perfil.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile picture
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, profilePic);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Update user profile
      await updateProfile(user, { displayName: name, photoURL: imageUrl });
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        imageUrl: imageUrl
      });

      toast({
        title: "Cuenta Creada",
        description: "Tu cuenta ha sido creada exitosamente. Por favor, inicia sesión.",
      })
      router.push("/")
    } catch (error: any) {
       let description = "Ocurrió un error inesperado al crear tu cuenta."
       if (error.code === 'auth/email-already-in-use') {
           description = "Este correo electrónico ya está en uso. Por favor, utiliza otro."
       } else if (error.code === 'auth/weak-password') {
           description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
       } else if (error.code === 'storage/unauthorized') {
            description = "Error de permisos al subir la imagen. Revisa las reglas de Storage."
       } else if (error.code) {
           description = error.message;
       }

       toast({
        title: "Error al Crear Cuenta",
        description: description,
        variant: "destructive"
      })
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Crear una cuenta</h1>
                <p className="text-muted-foreground">
                    Ingresa tus datos a continuación para crear tu cuenta.
                </p>
            </div>
            <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" type="text" placeholder="Ana García" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <Input id="email" type="email" placeholder="student@mail.udp.cl" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-2">
                <Input
                    id="profile-picture"
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                />
                <Button type="button" variant="outline" onClick={handleFileClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Foto
                </Button>
                {fileName && <span className="text-sm text-muted-foreground truncate">{fileName}</span>}
                </div>
            </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando Cuenta..." : "Crear Cuenta"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
                Iniciar Sesión
                </Link>
            </div>
        </div>
    </form>
  )
}
