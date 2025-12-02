// @/app/psychologists/[id]/page.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import { Star, Brain, Calendar, ArrowLeft, AlertCircle, Linkedin } from "lucide-react"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { useAuthState } from "react-firebase-hooks/auth"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportDialog } from "@/components/report-dialog"

export default function PsychologistProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [currentUser] = useAuthState(auth);

  const [psychologist, setPsychologist] = React.useState<User | null>(null)
  const [appUser, setAppUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const psychologistId = params.id as string

  React.useEffect(() => {
    if (!psychologistId) {
        setIsLoading(false);
        notFound();
        return;
    };
    
    setIsLoading(true);

    // Listen for real-time updates on the psychologist's profile
    const unsubscribe = onSnapshot(doc(db, "users", psychologistId), (doc) => {
        if (doc.exists() && doc.data().isTutor) {
            setPsychologist({ uid: doc.id, ...doc.data() } as User);
        } else {
            setPsychologist(null);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching psychologist:", error);
        setIsLoading(false);
        notFound();
    });

    const fetchCurrentUser = async () => {
       if(currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setAppUser({ uid: userDoc.id, ...userDoc.data() } as User)
            }
        }
    }

    fetchCurrentUser();
    
    return () => unsubscribe(); // Cleanup listener on component unmount

  }, [psychologistId, currentUser]);

  const handleBookSession = () => {
    router.push(`/tutors/${psychologistId}/book`);
  }

  if (isLoading) {
    return (
        <div className="mx-auto max-w-4xl space-y-8 p-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-8" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="flex flex-col items-center text-center">
                        <Skeleton className="h-40 w-40 rounded-full" />
                        <Skeleton className="h-8 w-48 mt-4" />
                        <Skeleton className="h-6 w-32 mt-2" />
                        <Skeleton className="h-12 w-full mt-6" />
                    </div>
                    <div className="mt-8">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-20 w-full mt-2" />
                        <Separator className="my-6" />
                        <Skeleton className="h-6 w-40" />
                        <div className="mt-4 space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!psychologist) {
    return notFound();
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                <ArrowLeft />
           </Button>
            {appUser && appUser.uid !== psychologist.uid && (
                <ReportDialog reportedUser={psychologist} reporterUser={appUser}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" /> Reportar
                    </Button>
                </ReportDialog>
            )}
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src={psychologist.imageUrl || 'https://placehold.co/400x400.png'}
                alt={psychologist.name}
                fill
                className="object-cover"
                data-ai-hint="person professional"
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold">{psychologist.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg">{psychologist.rating?.toFixed(1) ?? 'N/A'}</span>
              </div>
              <span>({psychologist.reviews ?? 0} reseñas)</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                 { currentUser?.uid !== psychologist.uid && (
                     <Button size="lg" className="w-full max-w-xs" onClick={handleBookSession}>
                        <Calendar className="mr-2 h-5 w-5" /> 
                        Enviar Solicitud
                    </Button>
                )}
                {psychologist.professionalLink && (
                    <Button size="lg" variant="outline" asChild className="w-full max-w-xs">
                        <a href={psychologist.professionalLink} target="_blank" rel="noopener noreferrer">
                           <Linkedin className="mr-2 h-5 w-5" /> Ver Perfil Profesional
                        </a>
                    </Button>
                )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Sobre Mí</h2>
            <p className="mt-2 text-muted-foreground">{psychologist.bio}</p>
            
            <Separator className="my-6" />

            <h2 className="text-xl font-semibold">Especialidades</h2>
            <ul className="mt-4 space-y-3">
              {psychologist.courses?.map((course) => (
                <li key={course} className="flex items-center justify-between rounded-lg bg-background p-3 border">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course}</span>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {formatCurrency(psychologist.hourlyRate || 0)}/sesión
                  </Badge>
                </li>
              ))}
            </ul>
             
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
