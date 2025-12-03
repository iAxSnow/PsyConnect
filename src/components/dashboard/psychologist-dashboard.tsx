// @/components/dashboard/psychologist-dashboard.tsx
"use client"

import * as React from "react"
import { getPsychologistPendingSessions, getPsychologistActiveSessions } from "@/services/sessions"
import type { Session } from "@/lib/types"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

import { SessionRequestCard } from "./session-request-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Inbox, CheckCircle2, User, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingDialog } from "@/components/profile/rating-dialog"

interface PsychologistDashboardProps {
  psychologistId: string
}

export function PsychologistDashboard({ psychologistId }: PsychologistDashboardProps) {
  const [pendingRequests, setPendingRequests] = React.useState<Session[]>([])
  const [activeSessions, setActiveSessions] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  const fetchRequests = React.useCallback(async () => {
      try {
        const [pending, active] = await Promise.all([
            getPsychologistPendingSessions(psychologistId),
            getPsychologistActiveSessions(psychologistId)
        ])
        setPendingRequests(pending)
        setActiveSessions(active)
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }, [psychologistId]);


  React.useEffect(() => {
    setIsLoading(true);
    fetchRequests();
  }, [fetchRequests])

  const handleRequestUpdate = () => {
    fetchRequests();
  }

  const handleCompleteSession = async (session: Session) => {
      try {
          const sessionRef = doc(db, "sessions", session.id);
          await updateDoc(sessionRef, { status: "completed" });
          toast({
              title: "Sesión Finalizada",
              description: "La sesión ha sido marcada como completada. El usuario ahora podrá calificar tu servicio.",
          })
          fetchRequests();
      } catch (error) {
          console.error("Error completing session:", error);
          toast({
              title: "Error",
              description: "No se pudo finalizar la sesión.",
              variant: "destructive"
          })
      }
  }

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-60 w-full" />
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Pending Requests Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Inbox className="text-primary"/>
            Nuevas Solicitudes ({pendingRequests.length})
        </h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(request => (
              <SessionRequestCard key={request.id} request={request} onUpdate={handleRequestUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-6 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No tienes solicitudes pendientes por responder.</p>
          </div>
        )}
      </div>

      {/* Active Sessions Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-600"/>
            Sesiones Activas ({activeSessions.length})
        </h2>
        {activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map(session => (
              <Card key={session.id} className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className="h-12 w-12 border">
                          <AvatarImage src={session.student.imageUrl} />
                          <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div>
                          <CardTitle className="text-lg">{session.student.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{session.student.email}</p>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                      <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Especialidad:</span>
                          <span className="font-medium">{session.course}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Solicitado el:</span>
                          <span className="font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {session.createdAt?.toDate().toLocaleDateString()}
                          </span>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-md text-sm mt-2">
                          <p className="font-medium mb-1">Contacto para agendar:</p>
                          <p className="text-muted-foreground break-all">{session.student.email}</p>
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleCompleteSession(session)}>
                          Finalizar Sesión
                      </Button>
                  </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-6 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No tienes sesiones activas en este momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
