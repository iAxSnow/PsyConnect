// @/app/dashboard/admin/page.tsx
"use client"
import { useRouter } from "next/navigation"
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

// Mock data for demonstration
const reports = [
  {
    id: "REP001",
    reportedUser: "Usuario Anónimo 1",
    reportedBy: "Dra. Ana Molina",
    reason: "Comportamiento inapropiado durante la sesión. El usuario utilizó lenguaje ofensivo y no respetó los tiempos de habla.",
    status: "Pendiente",
    date: "2023-10-26",
  },
  {
    id: "REP002",
    reportedUser: "Dra. Ana Molina",
    reportedBy: "Usuario Anónimo 2",
    reason: "La psicóloga no se presentó a la sesión agendada en la hora pactada. No hubo aviso previo.",
    status: "En Revisión",
    date: "2023-10-25",
  },
  {
    id: "REP003",
    reportedUser: "Usuario Anónimo 3",
    reportedBy: "Usuario Anónimo 4",
    reason: "Spam en el chat de la sesión, enviando enlaces a sitios externos no relacionados con la terapia.",
    status: "Resuelto",
    date: "2023-10-24",
  },
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Pendiente':
      return 'destructive'
    case 'En Revisión':
      return 'secondary'
    case 'Resuelto':
      return 'default'
    default:
      return 'outline'
  }
}


export default function AdminPage() {
    const router = useRouter()
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
                            {reports.map((report) => (
                                <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/admin/reports/${report.id}`)}>
                                    <TableCell className="font-medium">{report.reportedUser}</TableCell>
                                    <TableCell>{report.reportedBy}</TableCell>
                                    <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/admin/reports/${report.id}`)}}>
                                            <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
