// @/app/dashboard/admin/page.tsx
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { collection, query, onSnapshot, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, Report } from "@/lib/types"

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
import { Eye, Stethoscope, User as UserIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserWithReportCount extends User {
    reportsReceived: number;
    reportsMade: number;
}

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

function ReportsTable() {
    const router = useRouter();
    const [reports, setReports] = React.useState<Report[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const reportsData: Report[] = [];
            querySnapshot.forEach((doc) => {
                reportsData.push({ id: doc.id, ...doc.data() } as Report);
            });
            setReports(reportsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    return (
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
                                <Eye className="mr-2 h-4 w-4" /> Ver
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
    );
}

function UsersTable() {
    const router = useRouter();
    const [users, setUsers] = React.useState<UserWithReportCount[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

     React.useEffect(() => {
        const usersQuery = query(collection(db, "users"));
        
        const unsubscribe = onSnapshot(usersQuery, async () => {
            // Refetch both users and reports to ensure data consistency
            const reportsQuery = query(collection(db, "reports"));
            const [usersSnapshot, reportsSnapshot] = await Promise.all([
                getDocs(usersQuery),
                getDocs(reportsQuery)
            ]);

            const reportsData = reportsSnapshot.docs.map(doc => doc.data() as Report);

            const usersData = usersSnapshot.docs.map(doc => {
                const user = { id: doc.id, ...doc.data() } as User;
                const reportsReceived = reportsData.filter(r => r.reportedUserId === user.uid).length;
                const reportsMade = reportsData.filter(r => r.reportedByUserId === user.uid).length;
                return { ...user, reportsReceived, reportsMade };
            });

            setUsers(usersData.sort((a,b) => b.reportsReceived - a.reportsReceived));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Reportes Recibidos</TableHead>
                    <TableHead>Reportes Realizados</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? users.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.imageUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {user.name}
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant={user.isTutor ? "secondary" : "outline"}>
                                {user.isTutor ? <Stethoscope className="mr-1 h-3 w-3"/> : <UserIcon className="mr-1 h-3 w-3"/>}
                                {user.isTutor ? 'Psicólogo' : 'Usuario'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.reportsReceived > 0 ? "destructive" : "default"}>{user.reportsReceived}</Badge>
                        </TableCell>
                        <TableCell>{user.reportsMade}</TableCell>
                        <TableCell>
                            <Badge variant={user.isDisabled ? "destructive" : "success"}>
                                {user.isDisabled ? 'Suspendida' : 'Activa'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/admin/users/${user.id}`)}}>
                                <Eye className="mr-2 h-4 w-4" /> Ver Perfil
                            </Button>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No hay usuarios.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}


export default function AdminDashboardPage() {
    return (
        <Tabs defaultValue="reports" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Panel de Administrador</CardTitle>
                    <CardDescription>
                        Gestiona los reportes y usuarios de la plataforma desde aquí.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TabsList>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                        <TabsTrigger value="users">Usuarios</TabsTrigger>
                    </TabsList>
                </CardContent>
            </Card>

            <TabsContent value="reports">
                 <Card>
                    <CardHeader>
                        <CardTitle>Todos los Reportes</CardTitle>
                        <CardDescription>
                            Visualiza y gestiona los reportes enviados por los usuarios y psicólogos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ReportsTable />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="users">
                <Card>
                     <CardHeader>
                        <CardTitle>Gestionar Usuarios</CardTitle>
                        <CardDescription>
                            Supervisa la actividad de los usuarios y gestiona sus cuentas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UsersTable />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
