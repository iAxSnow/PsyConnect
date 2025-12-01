// @/components/auth/psychologist-signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Upload, DollarSign, Brain } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useToast } from "@/hooks/use-toast"
import { auth, db, storage } from "@/lib/firebase"
import { getAllCourses } from "@/services/courses"
import type { Course } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

export function PsychologistSignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Form State
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [profilePic, setProfilePic] = React.useState<File | null>(null)
  const [profilePicName, setProfilePicName] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [specialties, setSpecialties] = React.useState<string[]>([])
  const [hourlyRate, setHourlyRate] = React.useState("")

  // UI State
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [allCourses, setAllCourses] = React.useState<Course[]>([])
  const [isCoursesLoading, setIsCoursesLoading] = React.useState(true)

  const profilePicInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const fetchCourses = async () => {
      setIsCoursesLoading(true)
      try {
        const coursesList = await getAllCourses();
        setAllCourses(coursesList)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({ title: "Error", description: "No se pudieron cargar las especialidades.", variant: "destructive" })
      } finally {
        setIsCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [toast])

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicName(file.name)
      setProfilePic(file)
    }
  }

  const handleSpecialtyChange = (specialtyName: string, checked: boolean) => {
    setSpecialties(prev =>
      checked ? [...prev, specialtyName] : prev.filter(name => name !== specialtyName)
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profilePic) {
        toast({ title: "Archivo Faltante", description: "Por favor, sube una foto de perfil.", variant: "destructive" });
        return;
    }
    if (specialties.length === 0) {
        toast({ title: "Especialidades Faltantes", description: "Debes seleccionar al menos una especialidad.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    try {
        // Step 1: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Upload profile picture
        const profilePicPath = `profile-pictures/${user.uid}`;
        const profilePicRef = ref(storage, profilePicPath);
        await uploadBytes(profilePicRef, profilePic);
        const imageUrl = await getDownloadURL(profilePicRef);

        // Step 3: Update Firebase Auth profile
        await updateProfile(user, { displayName: name, photoURL: imageUrl });
        
        // Step 4: Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            imageUrl: imageUrl,
            isTutor: true,
            bio: bio,
            courses: specialties,
            hourlyRate: Number(hourlyRate),
            rating: 5.0,
            reviews: 0,
            isDisabled: true, // Account is disabled until approved
            validationStatus: 'pending', // Set to pending for admin review
        });
        
        toast({
            title: "Solicitud de Registro Enviada",
            description: "Tu cuenta ha sido creada y está pendiente de revisión. Te notificaremos pronto.",
        });

        router.push("/");

    } catch (error: any) {
        console.error("Signup Error:", error);
        let description = "Ocurrió un error inesperado durante el registro.";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                description = "Este correo electrónico ya está en uso. Por favor, utiliza otro.";
                break;
            case 'auth/weak-password':
                description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
                break;
            case 'storage/unauthorized':
                description = "Error de permisos al subir archivos. Revisa las reglas de seguridad de Firebase Storage.";
                break;
            case 'permission-denied':
                 description = "Error de permisos al guardar en la base de datos. Revisa las reglas de seguridad de Firestore."
                 break;
            default:
                description = error.message || description;
                break;
        }
        toast({ title: "Error de Registro", description, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Registro de Psicólogo</h1>
                <p className="text-muted-foreground">
                    Completa el formulario para ofrecer tus servicios en la plataforma.
                </p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" type="text" placeholder="Dra. Ana Molina" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Profesional</Label>
                    <Input id="email" type="email" placeholder="ana.molina@dominio.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" required value={password} onChange={e => setPassword(e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center gap-2">
                        <Input id="profile-picture" type="file" className="hidden" ref={profilePicInputRef} onChange={handleProfilePicChange} accept="image/*" required />
                        <Button type="button" variant="outline" onClick={() => profilePicInputRef.current?.click()}> <Upload className="mr-2 h-4 w-4" /> Subir Foto </Button>
                        {profilePicName && <span className="text-sm text-muted-foreground truncate">{profilePicName}</span>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Biografía</Label>
                    <Textarea placeholder="Cuéntanos sobre ti, tu enfoque y experiencia..." value={bio} onChange={(e) => setBio(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label>Especialidades</Label>
                    {isCoursesLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border rounded-md p-2">
                            {allCourses.map(course => (
                                <div key={course.id} className="flex items-center space-x-2">
                                    <Checkbox id={course.id} onCheckedChange={(checked) => handleSpecialtyChange(course.name, !!checked)} checked={specialties.includes(course.name)} />
                                    <label htmlFor={course.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{course.name}</label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rate">Tarifa por Sesión (CLP)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="rate" type="number" placeholder="30000" className="pl-10" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando Solicitud..." : "Registrarme y Enviar a Revisión"}
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
