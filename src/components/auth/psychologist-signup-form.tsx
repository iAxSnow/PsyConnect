// @/components/auth/psychologist-signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, DollarSign, Upload } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth"
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
  const [loadingStep, setLoadingStep] = React.useState<string>("") // Para mostrar qué está pasando
  const [allCourses, setAllCourses] = React.useState<Course[]>([])
  const [isCoursesLoading, setIsCoursesLoading] = React.useState(true)

  React.useEffect(() => {
    // Debug inicial del storage
    console.log("Configuración de Firebase Storage detectada:", storage.app.options.storageBucket);

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
    // Validación de tamaño de archivo (máx 5MB)
    if (titleFile.size > 5 * 1024 * 1024) {
         toast({ title: "Archivo muy grande", description: "El título profesional no debe superar los 5MB.", variant: "destructive" });
         return;
    }

    setIsLoading(true);
    setLoadingStep("Iniciando registro...");
    console.log("--- INICIO PROCESO REGISTRO ---");

    try {
        // 1. Create User in Auth
        setLoadingStep("Creando cuenta de usuario...");
        console.log("1. auth.createUserWithEmailAndPassword...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("   > Usuario creado OK. UID:", user.uid);

        // 2. Upload documents to Storage
        setLoadingStep("Subiendo documentos (esto puede tardar)...");
        console.log("2. Iniciando carga de archivos a Storage...");
        console.log("   Bucket:", storage.app.options.storageBucket);
        
        const uploadPromises = [];
        
        // Prepare Title Upload
        const titleExt = titleFile.name.split('.').pop() || 'pdf';
        const titleSafeName = `title_${Date.now()}.${titleExt}`;
        const titlePath = `documents/${user.uid}/${titleSafeName}`;
        const titleRef = ref(storage, titlePath);
        
        console.log(`   > Preparando subida Título: ${titlePath} (${titleFile.size} bytes)`);
        
        const metadata = {
            contentType: titleFile.type || 'application/pdf',
            customMetadata: { originalName: titleFile.name }
        };

        const uploadTitlePromise = uploadBytes(titleRef, titleFile, metadata)
            .then(snapshot => {
                console.log("   > Título subido EXITOSAMENTE:", snapshot.ref.fullPath);
                return snapshot;
            })
            .catch(err => {
                console.error("   > ERROR subiendo título:", err);
                throw err;
            });
        
        uploadPromises.push(uploadTitlePromise);

        // Prepare Certificates Upload
        if (certificateFiles) {
            for (let i = 0; i < certificateFiles.length; i++) {
                const file = certificateFiles[i];
                if (file.size > 5 * 1024 * 1024) {
                    console.warn(`   > Omitiendo certificado ${file.name} por ser muy grande (>5MB)`);
                    continue;
                }

                const certExt = file.name.split('.').pop() || 'pdf';
                const certSafeName = `cert_${i}_${Date.now()}.${certExt}`;
                const certPath = `documents/${user.uid}/certificates/${certSafeName}`;
                const certificateRef = ref(storage, certPath);
                
                console.log(`   > Preparando subida Certificado ${i+1}: ${certPath}`);

                const certMetadata = {
                    contentType: file.type || 'application/pdf',
                };

                const uploadCertPromise = uploadBytes(certificateRef, file, certMetadata)
                     .then(snapshot => {
                         console.log(`   > Certificado ${i+1} subido EXITOSAMENTE.`);
                         return snapshot;
                     })
                     .catch(err => {
                         console.error(`   > ERROR subiendo certificado ${i+1}:`, err);
                         throw err;
                     });
                uploadPromises.push(uploadCertPromise);
            }
        }
        
        // Timeout
        const uploadTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("TIMEOUT_UPLOAD")), 45000)
        );

        await Promise.race([Promise.all(uploadPromises), uploadTimeout]);
        console.log("2. Carga de archivos COMPLETADA.");


        const placeholderImageUrl = `https://placehold.co/200x200/EBF4FF/76A9FA?text=${name.charAt(0).toUpperCase()}`;

        // 3. Update Auth Profile
        setLoadingStep("Configurando perfil...");
        console.log("3. updateProfile...");
        await updateProfile(user, { displayName: name, photoURL: placeholderImageUrl });
        
        // 4. Save user data to Firestore
        setLoadingStep("Guardando datos finales...");
        console.log("4. setDoc (Firestore)...");
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
            isDisabled: true, 
            validationStatus: 'pending' as 'pending' | 'approved' | 'rejected',
        };

        await setDoc(userDocRef, userData)
        console.log("   > Datos Firestore guardados OK.");
        console.log("--- PROCESO EXITOSO ---");
        
        toast({
            title: "¡Registro Completado!",
            description: "Tu solicitud ha sido enviada correctamente.",
            duration: 5000,
        });
        
        setLoadingStep("Redirigiendo...");
        router.push("/");

    } catch (error: any) {
        console.error("--- ERROR EN PROCESO DE REGISTRO ---", error);
        setLoadingStep("");
        
        // Cleanup
        const currentUser = auth.currentUser;
        if (currentUser) {
            console.log("Limpiando usuario creado parcialmente...");
            try {
                await deleteUser(currentUser);
                console.log("Limpieza completada.");
            } catch (cleanupError) {
                console.error("Fallo al limpiar usuario:", cleanupError);
            }
        }

        setIsLoading(false);

        let description = "Ocurrió un error inesperado.";
        
        if (error.message === "TIMEOUT_UPLOAD") {
            description = "La subida de archivos tardó demasiado. Verifica tu conexión a internet o intenta con archivos más livianos.";
        } else if (error.code === 'storage/unauthorized') {
            description = "Permiso denegado al subir archivos. Contacta al administrador.";
        } else if (error.code === 'storage/retry-limit-exceeded') {
            description = "Error de conexión al subir archivos.";
        } else if (error.code === 'auth/email-already-in-use') {
             description = "El correo ya está registrado.";
        }

        toast({ 
            title: "Error de Registro", 
            description: `${description} (Código: ${error.code || 'N/A'})`, 
            variant: "destructive" 
        });
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
                    <Label htmlFor="title-file">Título Profesional (PDF, máx 5MB)</Label>
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
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {loadingStep}
                    </span>
                ) : "Registrarme y Enviar a Revisión"}
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
