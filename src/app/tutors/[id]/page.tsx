// @/app/tutors/[id]/page.tsx
import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, BookOpen, DollarSign, Calendar, Clock } from "lucide-react"

import { tutors } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TutorProfilePage({ params }: { params: { id: string } }) {
  const tutor = tutors.find((t) => t.id === params.id)

  if (!tutor) {
    notFound()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card>
        <CardContent className="p-6">
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
