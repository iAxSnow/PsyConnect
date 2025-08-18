// @/components/dashboard/tutor-card.tsx
import Image from "next/image"
import Link from "next/link"
import { Star, BookOpen } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"

interface TutorCardProps {
  tutor: User
}

export function TutorCard({ tutor }: TutorCardProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
  }

  return (
    <Link href={`/tutors/${tutor.id}`}>
      <Card className="h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={tutor.imageUrl}
              alt={tutor.name}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="person teaching"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg">{tutor.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{tutor.rating?.toFixed(1)}</span>
            </div>
            <span>({tutor.reviews} reseñas)</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
             <BookOpen className="h-4 w-4 text-primary" />
             <span className="font-medium">{tutor.courses?.[0]}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="w-full justify-center text-base">
            {formatCurrency(tutor.hourlyRate || 0)}/hr
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
