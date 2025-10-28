// @/app/dashboard/admin/users/page.tsx
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { collection, query, onSnapshot, getDocs } from "firebase/firestore"
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

interface UserWithReportCount extends User {
    reportsReceived: number;
    reportsMade: number;
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = React.useState<UserWithReportCount[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const usersQuery = query(collection(db, "users"));
        const reportsQuery = query(collection(db, "reports"));

        const unsubscribe = onSnapshot(usersQuery, async (usersSnapshot) => {
            const reportsSnapshot = await getDocs(reportsQuery);
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestionar Usuarios</CardTitle>
                    <CardDescription>
                       Supervisa la actividad de los usuarios y gestiona sus cuentas.
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
                                                <Eye className="mr-2 h-4 w-4" /> Ver
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
