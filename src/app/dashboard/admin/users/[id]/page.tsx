// @/app/dashboard/admin/users/[id]/page.tsx
"use client"

import * as React from "react"
import { useParams, notFound, useRouter } from 'next/navigation'
import Image from "next/image"
import { doc, onSnapshot, getDocs, collection, query, where, updateDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { ref, listAll, getDownloadURL } from "firebase/storage"
import type { User, Report } from "@/lib/types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User as UserIcon, Stethoscope, FileText, Ban, CheckCircle, AlertTriangle, Eye, Download, FileArchive } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const userId = params.id as string;
    
    const [user, setUser] = React.useState<User | null>(null);
    const [reportsAgainst, setReportsAgainst] = React.useState<Report[]>([]);
    const [reportsBy, setReportsBy] = React.useState<Report[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [certificateUrls, setCertificateUrls] = React.useState<string[]>([]);
    const [titleUrl, setTitleUrl] = React.useState<string | null>(null);
    const [isDocsLoading, setIsDocsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!userId) return;
        
        const userDocRef = doc(db, "users", userId);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = { id: docSnap.id, ...docSnap.data() } as User;
                setUser(userData);
                if (userData.isTutor) {
                    fetchDocuments(userData.uid);
                }
            } else {
                notFound();
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching user:", error);
            setIsLoading(false);
            notFound();
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

        const fetchDocuments = async (uid: string) => {
            setIsDocsLoading(true);
            try {
                // Fetch Title
                const titleFolderRef = ref(storage, `documents/${uid}/title`);
                const titleList = await listAll(titleFolderRef);
                if (titleList.items.length > 0) {
                    const url = await getDownloadURL(titleList.items[0]);
                    setTitleUrl(url);
                }

                // Fetch Certificates
                const certificatesFolderRef = ref(storage, `documents/${uid}/certificates`);
                const certificatesList = await listAll(certificatesFolderRef);
                const urls = await Promise.all(
                    certificatesList.items.map(itemRef => getDownloadURL(itemRef))
                );
                setCertificateUrls(urls);

            } catch (error) {
                console.error("Error fetching documents:", error);
                toast({
                    title: "Error al cargar documentos",
                    description: "No se pudieron obtener los certificados o el título.",
                    variant: "destructive"
                });
            } finally {
                setIsDocsLoading(false);
            }
        };


        fetchReports();

        return () => unsubscribeUser();
    }, [userId, toast]);
    
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


    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!user) {
        return notFound();
    }
    
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16 border">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <CardTitle className="text-2xl">{user.name}</CardTitle>
                             <CardDescription>{user.email}</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
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
                 <CardFooter className="border-t pt-4">
                    <Button 
                        variant={user.isDisabled ? "success" : "destructive"}
                        onClick={handleAccountStatusToggle}
                    >
                        {user.isDisabled ? <CheckCircle className="mr-2"/> : <Ban className="mr-2"/>}
                        {user.isDisabled ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                    </Button>
                </CardFooter>
            </Card>

            {user.isTutor && (
                 <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                               <FileText /> Título Profesional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             {isDocsLoading ? (
                                <Skeleton className="h-10 w-full"/>
                            ) : titleUrl ? (
                                <Button asChild variant="outline">
                                    <a href={titleUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4"/> Ver Título
                                    </a>
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground">No se encontró el título.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileArchive /> Certificados y Licencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {isDocsLoading ? (
                                <Skeleton className="h-10 w-full"/>
                            ) : certificateUrls.length > 0 ? (
                                <div className="space-y-2">
                                    {certificateUrls.map((url, index) => (
                                         <Button asChild variant="outline" key={index} className="w-full justify-start">
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4"/> Ver Certificado {index + 1}
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No se encontraron certificados.</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
            )}

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
                    <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/admin/reports/${report.id}`)}>
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
