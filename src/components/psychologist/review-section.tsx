// @/components/psychologist/review-section.tsx
"use client"

import * as React from "react"
import { Star, MessageSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RatingDialog } from "@/components/profile/rating-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

// Mock data for reviews
const reviews = [
  {
    id: 1,
    author: "Usuario Anónimo",
    avatar: "https://placehold.co/100x100/EBF4FF/76A9FA?text=A",
    rating: 5,
    comment: "La Dra. Molina es una excelente profesional. Me ayudó mucho a entender y manejar mi ansiedad. La recomiendo totalmente.",
    date: "Hace 2 semanas",
  },
  {
    id: 2,
    author: "Usuario Anónimo",
    avatar: "https://placehold.co/100x100/EBF4FF/76A9FA?text=B",
    rating: 4,
    comment: "Buena experiencia en general. Me sentí escuchado y comprendido. Las herramientas que me dio fueron útiles.",
    date: "Hace 1 mes",
  },
]

export function ReviewSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reseñas y Calificaciones</h2>
        <RatingDialog>
            <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" /> Escribir una reseña
            </Button>
        </RatingDialog>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar} alt={review.author} data-ai-hint="person" />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
