// @/app/tutors/book/page.tsx
"use client"

import * as React from "react"
import { Suspense } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Brain, CheckCircle } from "lucide-react"
import { doc, getDoc, addDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import type { User as AppUser, User } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

function BookSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const psychologistId = searchParams.get('id')
  const { toast } = useToast()
  const [currentUser, loadingAuth] = useAuthState(auth)

  const [psychologist, setPsychologist] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isBooking, setIsBooking] = React.useState(false)

  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("")
  const [appUser, setAppUser] = React.useState<AppUser | null>(null);

  React.useEffect(() => {
    if (loadingAuth) return; // Wait until auth state is loaded
    
    if (!currentUser) {
      // If user is not logged in at all, redirect them.
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para continuar.", variant: "destructive" });
      router.push("/");
      return;
    }

    if (!psychologistId) {
        // Handle missing ID
        return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const psychologistDocRef = doc(db, "users", psychologistId)
        const userDocRef = doc(db, "users", currentUser.uid);

        const [psychologistDoc, userDoc] = await Promise.all([
            getDoc(psychologistDocRef),
            getDoc(userDocRef)
        ]);

        if (!userDoc.exists()) {
            console.error("User profile not found in Firestore. Logging out.");
            toast({ title: "Error de Cuenta", description: "No se encontró tu perfil de usuario. Por favor, inicia sesión de nuevo.", variant: "destructive" });
            auth.signOut();
            router.push("/");
            return;
        }
        setAppUser({ id: userDoc.id, ...userDoc.data() } as AppUser);


        if (psychologistDoc.exists() && psychologistDoc.data().isTutor) {
          const psychoData = { id: psychologistDoc.id, ...psychologistDoc.data() } as User
          setPsychologist(psychoData)
          if(psychoData.courses?.[0]) {
            setSelectedSpecialty(psychoData.courses[0])
          }
        } else {
            // Handle not found
        }

      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [psychologistId, currentUser, loadingAuth, router, toast]);
  
  const handleBookSession = async () => {
    if (!currentUser || !appUser) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para enviar una solicitud.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    if (!psychologist || !selectedSpecialty) {
        toast({
            title: "Faltan datos",
            description: "Por favor, selecciona una especialidad.",
            variant: "destructive",
        })
        return;
    }

    setIsBooking(true)
    
    const sessionData = {
        studentId: appUser.uid,
        tutorId: psychologist.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        course: selectedSpecialty, 
        tutor: {
            name: psychologist.name,
            imageUrl: psychologist.imageUrl,
            email: psychologist.email,
        },
        student: {
            name: appUser.name,
            imageUrl: appUser.imageUrl,
            age: appUser.age
        }
    };

    addDoc(collection(db, "sessions"), sessionData)
      .then(() => {
        toast({
            title: "Solicitud Enviada",
            description: `Tu solicitud de sesión con ${psychologist!.name} ha sido enviada.`,
        })
        router.push("/dashboard");
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: "/sessions/{sessionId}",
          operation: 'create',
          requestResourceData: sessionData,
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsBooking(false)
      });
  }

  if (isLoading || loadingAuth) {
    return (
        <div className="mx-auto max-w-lg space-y-8 p-4">
            <Skeleton className="h-10 w-24" />
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!psychologistId || (!isLoading && !psychologist)) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">Psicólogo no encontrado</h2>
            <Button onClick={() => router.push('/dashboard')}>Volver</Button>
        </div>
    )
  }

  // Narrowing
  if (!psychologist) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Perfil
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contactar a {psychologist.name}</CardTitle>
          <CardDescription>Selecciona la especialidad por la que deseas consultar para enviar tu solicitud.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <div className="flex items-center gap-4 rounded-md border p-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    <Image
                        src={psychologist.imageUrl || 'https://placehold.co/200x200.png'}
                        alt={psychologist.name}
                        fill
                        className="object-cover"
                        data-ai-hint="person professional"
                    />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{psychologist.name}</h3>
                    <p className="text-sm text-muted-foreground">Psicólogo/a</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad de interés</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger id="specialty">
                        <Brain className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecciona una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                    {psychologist.courses?.map((course) => (
                        <SelectItem key={course} value={course}>
                        {course}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            
            <Button size="lg" className="w-full" onClick={handleBookSession} disabled={isBooking}>
                <CheckCircle className="mr-2 h-5 w-5" /> 
                {isBooking ? 'Enviando Solicitud...' : 'Enviar Solicitud'}
            </Button>

             <p className="text-xs text-muted-foreground text-center">
                Tu solicitud será enviada al psicólogo para su confirmación. Se te notificará cuando sea aceptada y podrás coordinar la sesión.
            </p>

        </CardContent>
      </Card>
    </div>
  )
}

export default function BookSessionPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Skeleton className="h-96 w-full max-w-lg" /></div>}>
            <BookSessionContent />
        </Suspense>
    )
}
