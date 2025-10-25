// @/components/profile/rating-dialog.tsx
"use client"

import * as React from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface RatingDialogProps {
    children?: React.ReactNode;
    onReviewSubmit?: (review: { rating: number; comment: string }) => void;
}


export function RatingDialog({ children, onReviewSubmit }: RatingDialogProps) {
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [hoverRating, setHoverRating] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = () => {
    if (rating === 0) {
        toast({
            title: "Calificación requerida",
            description: "Por favor, selecciona al menos una estrella.",
            variant: "destructive"
        })
        return;
    }
    
    if (onReviewSubmit) {
        onReviewSubmit({ rating, comment });
    }

    toast({
      title: "Reseña Enviada",
      description: "¡Gracias por tus comentarios!",
    })
    setOpen(false)
    setRating(0)
    setComment("")
  }
  
  const trigger = children || (
    <Button variant="outline">
        <Star className="mr-2 h-4 w-4" /> Calificar Sesión
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Califica tu sesión</DialogTitle>
          <DialogDescription>
            Tus comentarios ayudan a otros a encontrar los mejores psicólogos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-8 w-8 cursor-pointer transition-colors",
                    (hoverRating || rating) >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  )}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comentarios</Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos sobre tu experiencia..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Enviar Reseña</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
