// @/components/auth/signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [age, setAge] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    
    try {
      // 1. Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const displayName = name.trim();
      
      // 2. Update Firebase Auth profile
      await updateProfile(user, { displayName: displayName, photoURL: `https://placehold.co/200x200/EBF4FF/76A9FA?text=${displayName.charAt(0).toUpperCase()}` });


      // 3. Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        isTutor: false, // This is a regular user, not a psychologist
        name: displayName,
        age: Number(age),
        imageUrl: `https://placehold.co/200x200/EBF4FF/76A9FA?text=${displayName.charAt(0).toUpperCase()}`,
      });

      toast({
        title: "Cuenta Creada",
        description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      })

      router.push("/")

    } catch (error: any) {
       // Cleanup if Firestore fails but Auth succeeded
       const currentUser = auth.currentUser;
       if (currentUser) {
           try {
               await deleteUser(currentUser);
               console.log("Cleaned up phantom user after failed registration.");
           } catch (cleanupError) {
               console.error("Failed to cleanup user:", cleanupError);
           }
       }

       let description = "Ocurrió un error inesperado al crear tu cuenta."
       
       if (error.code) {
           switch (error.code) {
               case 'auth/email-already-in-use':
                   description = "Este correo electrónico ya está en uso. Por favor, utiliza otro."
                   break;
               case 'auth/weak-password':
                   description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
                   break;
                case 'permission-denied':
                    description = "Error de permisos al guardar en la base de datos. Revisa las reglas de seguridad de Firestore."
                    break;
               default:
                   description = error.message;
           }
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
                <h1 className="text-2xl font-bold">Crear una cuenta de usuario</h1>
                <p className="text-muted-foreground">
                    Ingresa tus datos para encontrar al psicólogo ideal.
                </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" type="text" placeholder="Juan Pérez" required value={name} onChange={e => setName(e.target.value)} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input id="age" type="number" placeholder="25" required value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" type="email" placeholder="tu.correo@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
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
            </div>
        </div>
        <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando Cuenta..." : "Crear Cuenta"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
                <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Volver a la selección
                </Link>
            </div>
        </div>
    </form>
  )
}
