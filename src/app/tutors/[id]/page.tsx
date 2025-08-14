// @/app/tutors/[id]/page.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { notFound, useRouter, useParams } from "next/navigation"
import { Star, BookOpen, Calendar, ArrowLeft } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Tutor } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function TutorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [tutor, setTutor] = React.useState<Tutor | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!params.id) return
    const fetchTutor = async () => {
      setIsLoading(true)
      try {
        const tutorDocRef = doc(db, "tutors", params.id as string)
        const tutorDoc = await getDoc(tutorDocRef)
        if (tutorDoc.exists()) {
          setTutor({ id: tutorDoc.id, ...tutorDoc.data() } as Tutor)
        } else {
          notFound()
        }
      } catch (error) {
        console.error("Error fetching tutor:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }
    fetchTutor()
  }, [params.id])


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

  if (!tutor) {
    return notFound();
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      <Card>
        <CardHeader>
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                <ArrowLeft />
           </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src={tutor.imageUrl}
                alt={tutor.name}
                fill
                className="object-cover"
                data-ai-hint="person teaching"
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold">{tutor.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-lg">{tutor.rating.toFixed(1)}</span>
              </div>
              <span>({tutor.reviews} reseñas)</span>
            </div>
            <Button size="lg" className="mt-6 w-full">
              <Calendar className="mr-2 h-5 w-5" /> Reservar una Sesión
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Sobre Mí</h2>
            <p className="mt-2 text-muted-foreground">{tutor.bio}</p>
            
            <Separator className="my-6" />

            <h2 className="text-xl font-semibold">Cursos Ofrecidos</h2>
            <ul className="mt-4 space-y-3">
              {tutor.courses.map((course) => (
                <li key={course} className="flex items-center justify-between rounded-lg bg-background p-3 border">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course}</span>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {formatCurrency(tutor.hourlyRate)}/hr
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
