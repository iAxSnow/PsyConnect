// @/app/tutors/profile/page.tsx
"use client"

import * as React from "react"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { Star, Brain, Calendar, ArrowLeft, AlertCircle, Linkedin, MessageSquare } from "lucide-react"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { User, Review } from "@/lib/types"
import { useAuthState } from "react-firebase-hooks/auth"
import { getReviewsForPsychologist } from "@/services/reviews"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportDialog } from "@/components/report-dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function TutorProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const psychologistId = searchParams.get('id')
  const [currentUser] = useAuthState(auth);

  const [psychologist, setPsychologist] = React.useState<User | null>(null)
  const [appUser, setAppUser] = React.useState<User | null>(null)
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!psychologistId) {
        setIsLoading(false);
        return; 
    };
    
    setIsLoading(true);

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

    const fetchReviews = async () => {
        try {
            const fetchedReviews = await getReviewsForPsychologist(psychologistId);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    }

    fetchCurrentUser();
    fetchReviews();
    
    return () => unsubscribe(); 

  }, [psychologistId, currentUser]);

  const handleBookSession = () => {
    router.push(`/tutors/book?id=${psychologistId}`);
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

  if (!psychologistId || (!isLoading && !psychologist)) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">Psicólogo no encontrado</h2>
            <Button onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
        </div>
    )
  }
  
  if (!psychologist) return null; 

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }

  const getPriceForSpecialty = (specialtyName: string) => {
      const rate = psychologist.specialtyRates?.find(r => r.name === specialtyName);
      if (rate) return rate.price;
      return psychologist.hourlyRate || 0;
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

            <h2 className="text-xl font-semibold">Especialidades y Tarifas</h2>
            <ul className="mt-4 space-y-3">
              {psychologist.courses?.map((course) => (
                <li key={course} className="flex items-center justify-between rounded-lg bg-background p-3 border">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course}</span>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {formatCurrency(getPriceForSpecialty(course))}/sesión
                  </Badge>
                </li>
              ))}
            </ul>

            <Separator className="my-6" />

            <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5"/>
                Reseñas de Pacientes
            </h2>
            <div className="mt-4 space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <Card key={review.id} className="bg-muted/30">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={review.authorImageUrl} />
                                            <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">{review.authorName}</p>
                                            <p className="text-xs text-muted-foreground">{review.createdAt.toDate().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1"/>
                                        <span className="font-medium">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">Este psicólogo aún no tiene reseñas.</p>
                )}
            </div>
             
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PsychologistProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Skeleton className="h-96 w-full max-w-4xl" /></div>}>
            <TutorProfileContent />
        </Suspense>
    )
}
