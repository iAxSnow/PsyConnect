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
import { Badge } from "@/components/ui/badge"
import { Check, X, User, Mail } from "lucide-react"

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
    <Card className="flex flex-col">
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
      <CardContent className="flex-grow">
        <p className="font-medium">
            Tema: <Badge variant="secondary">{request.course}</Badge>
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        {request.status === 'pending' ? (
             <div className="flex gap-2 w-full">
                <Button onClick={() => handleUpdateRequest('accepted')} disabled={isLoading} className="w-full">
                    <Check className="mr-2"/> Aceptar
                </Button>
                <Button onClick={() => handleUpdateRequest('declined')} disabled={isLoading} variant="outline" className="w-full">
                    <X className="mr-2"/> Rechazar
                </Button>
            </div>
        ) : (
            <div className="w-full text-center">
                 <p className="text-sm text-muted-foreground mb-2">Contacta al usuario para coordinar:</p>
                 {request.student.email ? (
                    <Button asChild variant="outline" className="w-full">
                        <a href={`mailto:${request.student.email}`}>
                            <Mail className="mr-2"/> {request.student.email}
                        </a>
                    </Button>
                 ) : (
                    <Badge variant="destructive">Correo no disponible</Badge>
                 )}
            </div>
        )}
      </CardFooter>
    </Card>
  )
}
