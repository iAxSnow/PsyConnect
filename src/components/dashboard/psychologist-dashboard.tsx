// @/components/dashboard/psychologist-dashboard.tsx
"use client"

import * as React from "react"
import { getPsychologistSessionRequests } from "@/services/sessions"
import type { Session } from "@/lib/types"

import { SessionRequestCard } from "./session-request-card"
import { Skeleton } from "@/components/ui/skeleton"

interface PsychologistDashboardProps {
  psychologistId: string
}

export function PsychologistDashboard({ psychologistId }: PsychologistDashboardProps) {
  const [requests, setRequests] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        const sessionRequests = await getPsychologistSessionRequests(psychologistId)
        setRequests(sessionRequests)
      } catch (error) {
        console.error("Error fetching session requests:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [psychologistId])

  const handleRequestUpdate = (sessionId: string) => {
    setRequests(prev => prev.filter(req => req.id !== sessionId));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Solicitudes de Sesión Pendientes</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(request => (
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
