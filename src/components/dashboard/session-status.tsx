// @/components/dashboard/session-status.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { getStudentSessions } from "@/services/sessions"
import type { Session } from "@/lib/types"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
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
        // Filter to show only pending and accepted sessions, and limit to 2
        const activeSessions = userSessions
          .filter(s => s.status === 'pending' || s.status === 'accepted')
          .slice(0, 2);
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
                <Skeleton className="h-7 w-3/5"/>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-20 w-full" />
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
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Estado de Solicitudes</CardTitle>
            <Button asChild variant="link" size="sm">
                <Link href="/profile">
                    Ver Todas <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell className="font-medium p-2">{session.tutor.name}</TableCell>
                <TableCell className="p-2 text-muted-foreground">{session.course}</TableCell>
                <TableCell className="p-2 text-right">
                  <Badge variant={getBadgeVariant(session.status)}>
                    {getStatusText(session.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
