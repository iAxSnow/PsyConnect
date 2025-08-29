// @/components/dashboard/psychologist-card.tsx
import Image from "next/image"
import Link from "next/link"
import { Star, Brain } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"

interface PsychologistCardProps {
  psychologist: User
}

export function PsychologistCard({ psychologist }: PsychologistCardProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
  }

  return (
    <Link href={`/tutors/${psychologist.uid}`}>
      <Card className="h-full flex flex-col transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={psychologist.imageUrl || 'https://placehold.co/400x400.png'}
              alt={psychologist.name}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="person professional"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg">{psychologist.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{psychologist.rating?.toFixed(1)}</span>
            </div>
            <span>({psychologist.reviews} reseñas)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
             <Brain className="h-4 w-4 text-primary" />
             <span className="font-medium">{psychologist.courses?.[0]}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Badge variant="secondary" className="w-full justify-center text-base">
            {formatCurrency(psychologist.hourlyRate || 0)}/sesión
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
