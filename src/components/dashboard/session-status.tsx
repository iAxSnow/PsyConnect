// @/components/dashboard/session-status.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { getStudentSessions } from "@/services/sessions"
import type { Session } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const getBadgeVariant = (status: Session['status']) => {
    switch (status) {
        case 'completed': return 'default';
        case 'accepted': return 'success';
        case 'pending': return 'secondary';
        case 'cancelled':
        case 'declined': return 'destructive'
        default: return 'outline';
    }
}

const getStatusText = (status: Session['status']) => {
    const map: Record<Session['status'], string> = {
        'pending': 'Pendiente',
        'accepted': 'Aceptada',
        'completed': 'Completada',
        'cancelled': 'Cancelada',
        'declined': 'Rechazada'
    }
    return map[status];
}

export function SessionStatus({ userId }: { userId: string }) {
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!userId) return

    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const userSessions = await getStudentSessions(userId)
        // Filter to show only pending and accepted sessions
        const activeSessions = userSessions.filter(
          s => s.status === 'pending' || s.status === 'accepted'
        )
        setSessions(activeSessions)
      } catch (error) {
        console.error("Error fetching sessions for dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [userId])
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-2/5"/>
                <Skeleton className="h-4 w-4/5"/>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
  }

  if (sessions.length === 0) {
    return null; // Don't render the component if there are no active sessions
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Solicitudes de Sesión</CardTitle>
        <CardDescription>
          Aquí puedes ver el estado de tus solicitudes de sesión más recientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Psicólogo</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.tutor.name}</TableCell>
                <TableCell>{session.course}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(session.status)}>
                    {getStatusText(session.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         <div className="mt-4 flex justify-end">
            <Button asChild variant="link">
                <Link href="/profile">
                    Ver todas mis sesiones <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
         </div>
      </CardContent>
    </Card>
  )
}
