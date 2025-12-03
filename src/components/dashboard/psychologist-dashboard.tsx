// @/components/dashboard/psychologist-dashboard.tsx
"use client"

import * as React from "react"
import { getPsychologistPendingSessions } from "@/services/sessions"
import type { Session } from "@/lib/types"

import { SessionRequestCard } from "./session-request-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Inbox } from "lucide-react"

interface PsychologistDashboardProps {
  psychologistId: string
}

export function PsychologistDashboard({ psychologistId }: PsychologistDashboardProps) {
  const [pendingRequests, setPendingRequests] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchRequests = React.useCallback(async () => {
      try {
        const sessions = await getPsychologistPendingSessions(psychologistId)
        setPendingRequests(sessions)
      } catch (error) {
        console.error("Error fetching pending sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }, [psychologistId]);


  React.useEffect(() => {
    setIsLoading(true);
    fetchRequests();
  }, [fetchRequests])

  const handleRequestUpdate = () => {
    // Refetch to get the updated list after a request is handled
    fetchRequests();
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Inbox className="text-primary"/>
            Nuevas Solicitudes de Sesión
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
    </div>
  )
}
