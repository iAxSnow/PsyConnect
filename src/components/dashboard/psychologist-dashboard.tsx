// @/components/dashboard/psychologist-dashboard.tsx
"use client"

import * as React from "react"
import { getPsychologistActiveSessions } from "@/services/sessions"
import type { Session } from "@/lib/types"

import { SessionRequestCard } from "./session-request-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Inbox, CheckCheck } from "lucide-react"

interface PsychologistDashboardProps {
  psychologistId: string
}

export function PsychologistDashboard({ psychologistId }: PsychologistDashboardProps) {
  const [activeSessions, setActiveSessions] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        const sessions = await getPsychologistActiveSessions(psychologistId)
        setActiveSessions(sessions)
      } catch (error) {
        console.error("Error fetching active sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [psychologistId])

  const handleRequestUpdate = (sessionId: string) => {
    // Instead of removing, we'll refetch to get the updated status
    const fetchRequests = async () => {
      try {
        const sessions = await getPsychologistActiveSessions(psychologistId)
        setActiveSessions(sessions)
      } catch (error) {
        console.error("Error refetching active sessions:", error)
      }
    }
    fetchRequests()
  }

  const pendingRequests = activeSessions.filter(s => s.status === 'pending');
  const acceptedSessions = activeSessions.filter(s => s.status === 'accepted');

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
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Inbox className="text-primary"/>
            Nuevas Solicitudes
        </h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(request => (
              <SessionRequestCard key={request.id} request={request} onUpdate={handleRequestUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-muted-foreground">No tienes solicitudes pendientes</h3>
            <p className="text-sm text-muted-foreground mt-2">Cuando un usuario solicite una sesión contigo, aparecerá aquí.</p>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <CheckCheck className="text-green-600"/>
            Sesiones Aceptadas
        </h2>
         {acceptedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedSessions.map(session => (
              <SessionRequestCard key={session.id} request={session} onUpdate={handleRequestUpdate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-muted-foreground">No tienes sesiones aceptadas</h3>
            <p className="text-sm text-muted-foreground mt-2">Una vez que aceptes una solicitud, aparecerá aquí para que puedas coordinar con el usuario.</p>
          </div>
        )}
      </div>
    </div>
  )
}
