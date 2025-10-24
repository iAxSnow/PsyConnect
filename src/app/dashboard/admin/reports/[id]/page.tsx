// @/app/dashboard/admin/reports/[id]/page.tsx
"use client"

import * as React from "react"
import { useParams, notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Shield, User, Calendar, MessageSquare, Check, X, Archive } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"


// Mock data - in a real app, this would be fetched from a database
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
      return 'success'
    case 'Descartado':
        return 'outline'
    default:
      return 'default'
  }
}

type ReportStatus = "Pendiente" | "En Revisión" | "Resuelto" | "Descartado";


export default function ReportDetailsPage() {
    const params = useParams();
    const { toast } = useToast();
    const reportId = params.id as string;
    
    const [report, setReport] = React.useState<(typeof reports)[0] | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate fetching data
        const foundReport = reports.find(r => r.id === reportId);
        setTimeout(() => {
            if (foundReport) {
                setReport(foundReport);
            }
            setIsLoading(false);
        }, 500)
    }, [reportId]);
    
    const handleStatusChange = (newStatus: ReportStatus) => {
        if (report) {
            setReport({...report, status: newStatus});
            toast({
                title: "Estado Actualizado",
                description: `El reporte ha sido marcado como "${newStatus}".`,
            })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-48" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!report) {
        return notFound();
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Detalle del Reporte: {report.id}</CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             <span>{report.date}</span>
                        </div>
                       <Badge variant={getStatusVariant(report.status)} className="text-base">{report.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><User className="text-destructive"/> Usuario Reportado</h3>
                            <p className="text-muted-foreground">{report.reportedUser}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Shield className="text-primary"/> Reportado Por</h3>
                            <p className="text-muted-foreground">{report.reportedBy}</p>
                        </div>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><MessageSquare /> Motivo del Reporte</h3>
                        <p className="text-muted-foreground bg-secondary/50 p-4 rounded-md border">{report.reason}</p>
                    </div>
                </CardContent>
                 <CardFooter className="flex-col sm:flex-row gap-2 border-t pt-6">
                    <p className="text-sm font-semibold mr-auto">Cambiar estado:</p>
                    <Button variant="outline" onClick={() => handleStatusChange("En Revisión")} disabled={report.status === "En Revisión"}>
                        <Archive className="mr-2"/> Marcar como En Revisión
                    </Button>
                    <Button variant="success" onClick={() => handleStatusChange("Resuelto")} disabled={report.status === "Resuelto"}>
                        <Check className="mr-2"/> Marcar como Resuelto
                    </Button>
                     <Button variant="destructive" onClick={() => handleStatusChange("Descartado")} disabled={report.status === "Descartado"}>
                        <X className="mr-2"/> Descartar Reporte
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
