// @/app/dashboard/admin/reports/[id]/page.tsx
"use client"

import * as React from "react"
import { useParams, notFound } from 'next/navigation'
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Report } from "@/lib/types"

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
    
    const [report, setReport] = React.useState<Report | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!reportId) return;
        const reportDocRef = doc(db, "reports", reportId);
        
        const unsubscribe = onSnapshot(reportDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setReport({ id: docSnap.id, ...docSnap.data() } as Report);
            } else {
                notFound();
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching report:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [reportId]);
    
    const handleStatusChange = async (newStatus: ReportStatus) => {
        if (report) {
            const reportDocRef = doc(db, "reports", report.id);
            try {
                await updateDoc(reportDocRef, { status: newStatus });
                toast({
                    title: "Estado Actualizado",
                    description: `El reporte ha sido marcado como "${newStatus}".`,
                });
            } catch (error) {
                 toast({
                    title: "Error al actualizar",
                    description: "No se pudo actualizar el estado del reporte.",
                    variant: "destructive"
                });
                console.error("Error updating report status:", error);
            }
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
                             <span>{report.createdAt.toDate().toLocaleDateString()}</span>
                        </div>
                       <Badge variant={getStatusVariant(report.status)} className="text-base">{report.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><User className="text-destructive"/> Usuario Reportado</h3>
                            <p className="text-muted-foreground">{report.reportedUserName}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Shield className="text-primary"/> Reportado Por</h3>
                            <p className="text-muted-foreground">{report.reportedByUserName}</p>
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
