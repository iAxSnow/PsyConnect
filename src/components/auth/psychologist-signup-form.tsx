// @/components/auth/psychologist-signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, DollarSign, Upload } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes } from "firebase/storage"
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
  const [bio, setBio] = React.useState("")
  const [specialties, setSpecialties] = React.useState<string[]>([])
  const [hourlyRate, setHourlyRate] = React.useState("")
  const [titleFile, setTitleFile] = React.useState<File | null>(null)
  const [certificateFiles, setCertificateFiles] = React.useState<FileList | null>(null)


  // UI State
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [allCourses, setAllCourses] = React.useState<Course[]>([])
  const [isCoursesLoading, setIsCoursesLoading] = React.useState(true)

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

  const handleSpecialtyChange = (specialtyName: string, checked: boolean) => {
    setSpecialties(prev =>
      checked ? [...prev, specialtyName] : prev.filter(name => name !== specialtyName)
    )
  }

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (specialties.length === 0) {
        toast({ title: "Especialidades Faltantes", description: "Debes seleccionar al menos una especialidad.", variant: "destructive" });
        return;
    }
    if (!hourlyRate) {
        toast({ title: "Tarifa Faltante", description: "Debes ingresar una tarifa por sesión.", variant: "destructive" });
        return;
    }
    if (!titleFile) {
        toast({ title: "Título Faltante", description: "Debes subir tu título profesional.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    try {
        // 1. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Upload documents to Storage
        const uploadPromises = [];
        
        // Upload Title
        const titleRef = ref(storage, `documents/${user.uid}/title/${titleFile.name}`);
        uploadPromises.push(uploadBytes(titleRef, titleFile));

        // Upload Certificates
        if (certificateFiles) {
            for (let i = 0; i < certificateFiles.length; i++) {
                const file = certificateFiles[i];
                const certificateRef = ref(storage, `documents/${user.uid}/certificates/${file.name}`);
                uploadPromises.push(uploadBytes(certificateRef, file));
            }
        }
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);


        const placeholderImageUrl = `https://placehold.co/200x200/EBF4FF/76A9FA?text=${name.charAt(0).toUpperCase()}`;

        // 3. Update Auth Profile
        await updateProfile(user, { displayName: name, photoURL: placeholderImageUrl });
        
        // 4. Save user data to Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userData = {
            uid: user.uid,
            name: name,
            email: email,
            imageUrl: placeholderImageUrl,
            isTutor: true,
            bio: bio,
            courses: specialties,
            hourlyRate: Number(hourlyRate),
            rating: 5.0,
            reviews: 0,
            isDisabled: true, // Account is disabled until approved by an admin
            validationStatus: 'pending' as 'pending' | 'approved' | 'rejected',
        };

        await setDoc(userDocRef, userData)
        
        toast({
            title: "Solicitud de Registro Enviada",
            description: "Tu cuenta ha sido creada y está pendiente de revisión. Te notificaremos pronto.",
        });
        router.push("/");

    } catch (error: any) {
        setIsLoading(false);
        console.error("Signup Error:", error);

        let description = "Ocurrió un error inesperado durante el registro.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                description = "Este correo electrónico ya está en uso. Por favor, utiliza otro.";
                break;
            case 'auth/weak-password':
                description = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
                break;
            case 'storage/retry-limit-exceeded':
                description = "Se superó el tiempo de espera para subir archivos. Revisa tu conexión de red e inténtalo de nuevo.";
                break;
            case 'storage/unauthorized':
                 description = "Error de permisos al subir archivos. Revisa las reglas de seguridad de Storage.";
                 break;
            default:
                description = error.message || description;
                break;
        }
        toast({ title: "Error de Registro", description, variant: "destructive" });
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
                 <div className="space-y-2">
                    <Label htmlFor="title-file">Título Profesional (PDF)</Label>
                     <Input id="title-file" type="file" required accept="application/pdf" onChange={(e) => setTitleFile(e.target.files ? e.target.files[0] : null)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="certs-file">Certificados y Licencia (PDF, opcional)</Label>
                     <Input id="certs-file" type="file" multiple accept="application/pdf" onChange={(e) => setCertificateFiles(e.target.files)} />
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
