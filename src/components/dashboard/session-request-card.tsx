// @/components/dashboard/session-request-card.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import type { Session } from "@/lib/types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, X, User } from "lucide-react"

interface SessionRequestCardProps {
  request: Session,
  onUpdate: (sessionId: string) => void
}

export function SessionRequestCard({ request, onUpdate }: SessionRequestCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleUpdateRequest = async (status: 'accepted' | 'declined') => {
    setIsLoading(true)
    const sessionDocRef = doc(db, "sessions", request.id)
    try {
      await updateDoc(sessionDocRef, { status: status })
      toast({
        title: `Solicitud ${status === 'accepted' ? 'Aceptada' : 'Rechazada'}`,
        description: `La solicitud de sesión ha sido actualizada.`,
      })
      // Always remove the card from the view after an action
      onUpdate(request.id);
    } catch (error) {
      console.error("Error updating session status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const student = request.student;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student?.imageUrl} alt={student?.name} data-ai-hint="person" />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{student?.name}</CardTitle>
            {student?.age && (
                 <CardDescription>{student.age} años</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
            Tema: <span className="font-normal text-muted-foreground">{request.course}</span>
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={() => handleUpdateRequest('accepted')} disabled={isLoading} className="w-full">
            <Check className="mr-2"/> Aceptar
        </Button>
        <Button onClick={() => handleUpdateRequest('declined')} disabled={isLoading} variant="outline" className="w-full">
            <X className="mr-2"/> Rechazar
        </Button>
      </CardFooter>
    </Card>
  )
}
