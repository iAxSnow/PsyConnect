// @/app/dashboard/admin/users/details/page.tsx
"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { doc, onSnapshot, getDocs, collection, query, where, updateDoc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import type { User, Report } from "@/lib/types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User as UserIcon, Stethoscope, FileText, Ban, CheckCircle, AlertTriangle, Eye, ShieldCheck, ShieldX, Linkedin } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function UserDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const userId = searchParams.get('id');
    
    const [user, setUser] = React.useState<User | null>(null);
    const [reportsAgainst, setReportsAgainst] = React.useState<Report[]>([]);
    const [reportsBy, setReportsBy] = React.useState<Report[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCheckingRole, setIsCheckingRole] = React.useState(true); // Role check state

    // 1. Admin Role Check
    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
                return;
            }

            try {
                if (currentUser.email !== "admin@connect.udp.cl") {
                     toast({
                        title: "Acceso denegado",
                        description: "No tienes permisos para ver este detalle de usuario.",
                        variant: "destructive"
                    });
                    router.push("/dashboard");
                    return;
                }
                
                setIsCheckingRole(false); // Valid admin
            } catch (error) {
                console.error("Auth check error:", error);
                router.push("/dashboard");
            }
        });

        return () => unsubscribeAuth();
    }, [router, toast]);


    // 2. Data Fetching (Only runs if role is checked)
    React.useEffect(() => {
        if (isCheckingRole || !userId) return;
        
        const userDocRef = doc(db, "users", userId);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = { id: docSnap.id, ...docSnap.data() } as User;
                setUser(userData);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching user:", error);
            setIsLoading(false);
        });

        const fetchReports = async () => {
             const reportsRef = collection(db, "reports");
             
             const againstQuery = query(reportsRef, where("reportedUserId", "==", userId));
             const byQuery = query(reportsRef, where("reportedByUserId", "==", userId));

             const [againstSnapshot, bySnapshot] = await Promise.all([
                getDocs(againstQuery),
                getDocs(byQuery)
             ]);

             setReportsAgainst(againstSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Report)));
             setReportsBy(bySnapshot.docs.map(d => ({id: d.id, ...d.data()} as Report)));
        }

        fetchReports();

        return () => unsubscribeUser();
    }, [userId, toast, isCheckingRole]);
    
    const handleAccountStatusToggle = async () => {
        if (!user) return;

        const newStatus = !user.isDisabled;
        const userDocRef = doc(db, "users", user.id);

        try {
            await updateDoc(userDocRef, { isDisabled: newStatus });
            toast({
                title: "Cuenta Actualizada",
                description: `La cuenta de ${user.name} ha sido ${newStatus ? 'suspendida' : 'reactivada'}.`,
            });
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado de la cuenta.",
                variant: "destructive"
            });
        }
    }

    const handleValidation = async (status: 'approved' | 'rejected') => {
        if (!user || !user.isTutor) return;

        const userDocRef = doc(db, "users", user.id);
        const updateData: Partial<User> = { validationStatus: status };
        if (status === 'approved') {
            updateData.isDisabled = false; // Enable account on approval
        }

        try {
            await updateDoc(userDocRef, updateData);
            toast({
                title: `Registro ${status === 'approved' ? 'Aprobado' : 'Rechazado'}`,
                description: `El psicólogo ${user.name} ha sido ${status === 'approved' ? 'aprobado' : 'rechazado'}.`
            });
            router.push('/dashboard/admin');
        } catch (error) {
            console.error("Error updating validation status:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el estado de validación.",
                variant: "destructive"
            });
        }
    }


    if (isCheckingRole) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <p className="text-muted-foreground">Verificando permisos de administrador...</p>
                 </div>
            </div>
        )
    }

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!userId || (!isLoading && !user)) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold">Usuario no encontrado</h2>
                <Button variant="link" onClick={() => router.back()}>Volver</Button>
            </div>
        )
    }

    // Narrowing
    if (!user) return null;
    
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-4">
                         <Avatar className="h-16 w-16 border">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <CardTitle className="text-2xl">{user.name}</CardTitle>
                             <CardDescription>{user.email}</CardDescription>
                             {user.isTutor && user.professionalLink && (
                                <Button asChild variant="link" className="px-0 h-auto mt-1">
                                    <a href={user.professionalLink} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="mr-2"/>
                                        Ver Perfil Profesional
                                    </a>
                                </Button>
                             )}
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-2">
                            <Badge variant={user.isTutor ? "secondary" : "outline"} className="text-sm">
                                {user.isTutor ? <Stethoscope className="mr-2 h-4 w-4"/> : <UserIcon className="mr-2 h-4 w-4"/>}
                                {user.isTutor ? 'Psicólogo' : 'Usuario'}
                            </Badge>
                             <Badge variant={user.isDisabled ? "destructive" : "success"} className="text-sm">
                                {user.isDisabled ? <Ban className="mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                                {user.isDisabled ? 'Suspendida' : 'Activa'}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                 <CardFooter className="border-t pt-4 flex justify-between items-center">
                     <div>
                        {user.isTutor && user.validationStatus === 'pending' ? (
                            <div className="flex gap-2">
                                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleValidation('approved')}>
                                    <ShieldCheck className="mr-2"/> Aprobar Registro
                                </Button>
                                <Button variant="destructive" onClick={() => handleValidation('rejected')}>
                                    <ShieldX className="mr-2"/> Rechazar Registro
                                </Button>
                            </div>
                        ) : (
                             <Button 
                                variant={user.isDisabled ? "default" : "destructive"}
                                className={user.isDisabled ? "bg-green-600 hover:bg-green-700" : ""}
                                onClick={handleAccountStatusToggle}
                            >
                                {user.isDisabled ? <CheckCircle className="mr-2"/> : <Ban className="mr-2"/>}
                                {user.isDisabled ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                            </Button>
                        )}
                     </div>
                </CardFooter>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <AlertTriangle className="text-destructive"/> Reportes en Contra ({reportsAgainst.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReportTable reports={reportsAgainst} type="against" router={router}/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <FileText /> Reportes Realizados ({reportsBy.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ReportTable reports={reportsBy} type="by" router={router}/>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ReportTable({ reports, type, router }: { reports: Report[], type: 'by' | 'against', router: any }) {
    if (reports.length === 0) {
        return <p className="text-muted-foreground text-sm text-center py-8">No hay reportes que mostrar.</p>
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{type === 'by' ? 'Usuario Reportado' : 'Reportado Por'}</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead><span className="sr-only"></span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reports.map(report => (
                    <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/admin/reports/details?id=${report.id}`)}>
                        <TableCell className="font-medium">
                            {type === 'by' ? report.reportedUserName : report.reportedByUserName}
                        </TableCell>
                        <TableCell>{report.createdAt.toDate().toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4"/></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function UserDetailsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Skeleton className="h-96 w-full max-w-6xl" /></div>}>
            <UserDetailsContent />
        </Suspense>
    )
}
