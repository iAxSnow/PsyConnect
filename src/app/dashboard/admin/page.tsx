// @/app/dashboard/admin/page.tsx
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Report } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Pendiente':
      return 'destructive'
    case 'En Revisión':
      return 'secondary'
    case 'Resuelto':
      return 'success'
    default:
      return 'outline'
  }
}

export default function AdminPage() {
    const router = useRouter()
    const [reports, setReports] = React.useState<Report[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reportsData: Report[] = []
            querySnapshot.forEach((doc) => {
                reportsData.push({ id: doc.id, ...doc.data() } as Report)
            })
            setReports(reportsData)
            setIsLoading(false)
        }, (error) => {
            console.error("Error fetching reports:", error);
            setIsLoading(false);
        })

        return () => unsubscribe()
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Panel de Administrador</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Reportes de Usuarios</CardTitle>
                    <CardDescription>
                        Gestiona los reportes enviados por los usuarios y psicólogos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario Reportado</TableHead>
                                    <TableHead>Reportado Por</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Acciones</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length > 0 ? reports.map((report) => (
                                    <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/admin/reports/${report.id}`)}>
                                        <TableCell className="font-medium">{report.reportedUserName}</TableCell>
                                        <TableCell>{report.reportedByUserName}</TableCell>
                                        <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                                        <TableCell>{report.createdAt.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/admin/reports/${report.id}`)}}>
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No hay reportes.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
