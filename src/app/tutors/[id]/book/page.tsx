// @/app/tutors/[id]/book/page.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { notFound, useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Brain, Clock, CheckCircle } from "lucide-react"
import { doc, getDoc, addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import type { User as AppUser, User } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"


export default function BookSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser] = useAuthState(auth)

  const [psychologist, setPsychologist] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isBooking, setIsBooking] = React.useState(false)

  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [appUser, setAppUser] = React.useState<AppUser | null>(null);

  const psychologistId = params.id as string

  React.useEffect(() => {
    if (!psychologistId || !currentUser) return
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const psychologistDocRef = doc(db, "users", psychologistId)
        const userDocRef = doc(db, "users", currentUser.uid);

        const [psychologistDoc, userDoc] = await Promise.all([
            getDoc(psychologistDocRef),
            getDoc(userDocRef)
        ]);

        if (psychologistDoc.exists() && psychologistDoc.data().isTutor) {
          const psychoData = { id: psychologistDoc.id, ...psychologistDoc.data() } as User
          setPsychologist(psychoData)
          if(psychoData.courses?.[0]) {
            setSelectedSpecialty(psychoData.courses[0])
          }
        } else {
          notFound()
        }

        if (userDoc.exists()) {
          setAppUser({ id: userDoc.id, ...userDoc.data() } as AppUser);
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [psychologistId, currentUser])
  
  const handleBookSession = async () => {
    if (!currentUser || !appUser) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agendar una cita.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    if (!psychologist || !selectedSpecialty || !selectedDate) {
        toast({
            title: "Faltan datos",
            description: "Por favor, selecciona una especialidad y una fecha.",
            variant: "destructive",
        })
        return;
    }

    setIsBooking(true)
    try {
        const studentName = appUser.name;
        const studentImageUrl = appUser.imageUrl;
        const studentAge = appUser.age;

        await addDoc(collection(db, "sessions"), {
            studentId: currentUser.uid,
            tutorId: psychologist.id,
            status: 'pending',
            createdAt: serverTimestamp(),
            sessionDate: Timestamp.fromDate(selectedDate),
            course: selectedSpecialty, 
             tutor: {
                name: psychologist.name,
                imageUrl: psychologist.imageUrl,
            },
            student: {
                name: studentName,
                imageUrl: studentImageUrl,
                age: studentAge
            }
        });

        toast({
            title: "Solicitud Enviada",
            description: `Tu solicitud de sesión con ${psychologist.name} ha sido enviada.`,
        })
        router.push("/dashboard");

    } catch (error) {
        console.error("Error booking session:", error)
        toast({
            title: "Error",
            description: "No se pudo agendar la sesión. Inténtalo de nuevo.",
            variant: "destructive",
        })
    } finally {
        setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
        <div className="mx-auto max-w-4xl space-y-8 p-4">
            <Skeleton className="h-10 w-24" />
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                         <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!psychologist) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Perfil
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Agendar Sesión con {psychologist.name}</CardTitle>
          <CardDescription>Selecciona la especialidad y la fecha para tu sesión.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex justify-center items-center">
                 <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
            </div>
            <div className="space-y-6">
                 <div className="flex items-start gap-4">
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
                        <h3 className="font-bold">{psychologist.name}</h3>
                        <p className="text-sm text-muted-foreground">Psicólogo/a</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidad</Label>
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
                
                <div className="space-y-2">
                    <Label>Fecha Seleccionada</Label>
                     <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span>{selectedDate ? selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) : 'Ninguna'}</span>
                    </div>
                </div>
                
                <Button size="lg" className="w-full" onClick={handleBookSession} disabled={isBooking}>
                    <CheckCircle className="mr-2 h-5 w-5" /> 
                    {isBooking ? 'Enviando Solicitud...' : 'Confirmar y Solicitar Sesión'}
                </Button>

                 <p className="text-xs text-muted-foreground text-center">
                    Tu solicitud será enviada al psicólogo para su confirmación. Se te notificará cuando sea aceptada.
                </p>

            </div>
        </CardContent>
      </Card>
    </div>
  )
}
