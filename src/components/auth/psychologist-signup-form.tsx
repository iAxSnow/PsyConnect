// @/components/auth/psychologist-signup-form.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, DollarSign, Linkedin } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { getAllCourses } from "@/services/courses"
import type { Course } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

interface SpecialtyPrice {
    name: string;
    price: string;
}

export function PsychologistSignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Form State
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [specialties, setSpecialties] = React.useState<string[]>([])
  const [specialtyPrices, setSpecialtyPrices] = React.useState<SpecialtyPrice[]>([])
  const [professionalLink, setProfessionalLink] = React.useState("")

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
    setSpecialties(prev => {
      const newSpecialties = checked 
        ? [...prev, specialtyName] 
        : prev.filter(name => name !== specialtyName);
      
      if (checked) {
          setSpecialtyPrices(prevPrices => [...prevPrices, { name: specialtyName, price: "" }]);
      } else {
          setSpecialtyPrices(prevPrices => prevPrices.filter(sp => sp.name !== specialtyName));
      }
      return newSpecialties;
    })
  }

  const handlePriceChange = (specialtyName: string, price: string) => {
      setSpecialtyPrices(prev => prev.map(sp => 
          sp.name === specialtyName ? { ...sp, price } : sp
      ));
  }

 const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (specialties.length === 0) {
        toast({ title: "Especialidades Faltantes", description: "Debes seleccionar al menos una especialidad.", variant: "destructive" });
        return;
    }
    
    const missingPrice = specialtyPrices.some(sp => !sp.price);
    if (missingPrice) {
         toast({ title: "Precios Faltantes", description: "Por favor define un precio para cada especialidad seleccionada.", variant: "destructive" });
         return;
    }
    
    setIsLoading(true);

    try {
        // 1. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const placeholderImageUrl = `https://placehold.co/200x200/EBF4FF/76A9FA?text=${name.charAt(0).toUpperCase()}`;

        // 2. Update Auth Profile
        await updateProfile(user, { displayName: name, photoURL: placeholderImageUrl });
        
        // 3. Save user data to Firestore
        const userDocRef = doc(db, "users", user.uid);
        
        const prices = specialtyPrices.map(sp => Number(sp.price)).filter(p => !isNaN(p));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        const userData = {
            uid: user.uid,
            name: name,
            email: email,
            imageUrl: placeholderImageUrl,
            isTutor: true,
            bio: bio,
            courses: specialties, 
            specialtyRates: specialtyPrices.map(sp => ({ name: sp.name, price: Number(sp.price) })),
            hourlyRate: minPrice, 
            professionalLink: professionalLink,
            rating: 5.0,
            reviews: 0,
            isDisabled: true, 
            validationStatus: 'pending' as 'pending' | 'approved' | 'rejected',
        };

        await setDoc(userDocRef, userData)
        
        toast({
            title: "¡Registro Completado!",
            description: "Tu solicitud ha sido enviada correctamente. Un administrador la revisará pronto.",
            duration: 5000,
        });
        
        router.push("/");

    } catch (error: any) {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === email) {
             try { await deleteUser(currentUser); } catch (e) {}
        }

        setIsLoading(false);

        let description = "Ocurrió un error inesperado.";
        if (error.code === 'auth/email-already-in-use') {
             description = "El correo electrónico ya está registrado.";
        }

        toast({ 
            title: "Error de Registro", 
            description: description, 
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
                    <Label htmlFor="professionalLink">Perfil Profesional (LinkedIn, etc.)</Label>
                    <div className="relative">
                         <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input id="professionalLink" type="url" placeholder="https://linkedin.com/in/tu-perfil" required value={professionalLink} onChange={e => setProfessionalLink(e.target.value)} className="pl-9" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Biografía</Label>
                    <Textarea placeholder="Cuéntanos sobre ti, tu enfoque y experiencia..." value={bio} onChange={(e) => setBio(e.target.value)} required />
                </div>
                 <div className="space-y-4 border rounded-md p-4">
                    <Label className="text-base font-semibold">Especialidades y Tarifas</Label>
                    <p className="text-sm text-muted-foreground mb-2">Selecciona tus especialidades y define el precio por sesión (CLP) para cada una.</p>
                    
                    {isCoursesLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {allCourses.map(course => {
                                const isSelected = specialties.includes(course.name);
                                const currentPrice = specialtyPrices.find(sp => sp.name === course.name)?.price || "";

                                return (
                                    <div key={course.id} className="flex items-center justify-between gap-4 p-2 border rounded-sm">
                                        <div className="flex items-center space-x-2 flex-grow">
                                            <Checkbox 
                                                id={course.id} 
                                                onCheckedChange={(checked) => handleSpecialtyChange(course.name, !!checked)} 
                                                checked={isSelected} 
                                            />
                                            <label htmlFor={course.id} className="text-sm font-medium leading-none cursor-pointer">
                                                {course.name}
                                            </label>
                                        </div>
                                        {isSelected && (
                                            <div className="relative w-32">
                                                 <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                 <Input 
                                                    type="number" 
                                                    className="h-8 pl-6 text-sm" 
                                                    placeholder="Precio" 
                                                    value={currentPrice}
                                                    onChange={(e) => handlePriceChange(course.name, e.target.value)}
                                                    required
                                                 />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Finalizando Registro..." : "Registrarme y Enviar a Revisión"}
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
