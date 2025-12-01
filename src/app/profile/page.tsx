// @/app/profile/page.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, Calendar, History, ArrowLeft, MessageSquare, Star, Mail } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { getStudentSessions } from "@/services/sessions"
import { doc, getDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingDialog } from "@/components/profile/rating-dialog"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { Session, User as AppUser } from "@/lib/types"

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

const SessionRow = ({ session, router, isPsychologist }: { session: Session; router: ReturnType<typeof useRouter>; isPsychologist: boolean }) => {
    const userToShow = isPsychologist ? session.student : session.tutor;

    return (
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userToShow?.imageUrl} alt={userToShow?.name} data-ai-hint="person" />
                <AvatarFallback>{userToShow?.name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{userToShow?.name}</div>
                <div className="text-sm text-muted-foreground">{session.course}</div>
              </div>
            </div>
          </TableCell>
          <TableCell>{session.createdAt.toDate().toLocaleDateString()}</TableCell>
          <TableCell>
            <Badge variant={getBadgeVariant(session.status)} className="capitalize">
                {getStatusText(session.status)}
            </Badge>
          </TableCell>
           <TableCell className="text-right">
            {session.status === 'completed' && !isPsychologist && (
                <RatingDialog>
                    <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" /> Calificar
                    </Button>
                </RatingDialog>
            )}
            {session.status === 'accepted' && !isPsychologist && (
                <div className="flex items-center justify-end gap-1 text-xs">
                    <span className="text-muted-foreground">contacta mandando un correo aqui:</span>
                     {session.tutor.email ? (
                        <a href={`mailto:${session.tutor.email}`} className="text-primary hover:underline font-semibold">
                            {session.tutor.email}
                        </a>
                     ) : (
                        <span className="text-destructive font-semibold">Correo no disponible. Por favor, cancela y vuelve a enviar la solicitud.</span>
                     )}
                </div>
            )}
          </TableCell>
        </TableRow>
    );
};

export default function ProfilePage() {
  const router = useRouter()
  const [user, loadingAuth] = useAuthState(auth)
  const [appUser, setAppUser] = React.useState<AppUser | null>(null);
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
              setAppUser({ id: userDoc.id, ...userDoc.data() } as AppUser);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error)
        } finally {
          setIsLoading(false)
        }
      } else if (!loadingAuth) {
        router.push("/");
      }
    };
    fetchUserData();
  }, [user, loadingAuth, router])

  React.useEffect(() => {
    if (!appUser?.uid) return;

    const fetchSessions = async () => {
      try {
        const sessionsList = await getStudentSessions(appUser.uid);
        setSessions(sessionsList);
      } catch (error) {
        console.error("Error fetching sessions: ", error);
      }
    };
    fetchSessions();
  }, [appUser?.uid]);

  const handleProfileUpdate = React.useCallback((updatedUser: Partial<AppUser>) => {
    setAppUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
  }, []);
  
  if (isLoading || loadingAuth) {
    return (
        <div className="space-y-6 p-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-8" />
                </CardHeader>
                <CardContent className="p-6 pt-0 flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <Skeleton className="h-10 w-10" />
                </CardContent>
            </Card>
            <Skeleton className="h-10 w-full rounded-md" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!appUser) {
    return null; 
  }

  const isPsychologist = appUser.isTutor;
  const activeSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'pending');
  const pastSessions = sessions.filter(s => s.status !== 'accepted' && s.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft />
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary">
            <Image
              src={appUser.imageUrl || `https://placehold.co/200x200/EBF4FF/76A9FA?text=${appUser.name.charAt(0).toUpperCase()}`}
              alt="User profile picture"
              fill
              className="object-cover"
              data-ai-hint="person student"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{appUser.name}</h2>
            <p className="text-muted-foreground">{appUser.email}</p>
            {appUser.age && <p className="text-muted-foreground">{appUser.age} años</p>}
             {isPsychologist && <Badge className="mt-2">Psicólogo</Badge>}
          </div>
          <EditProfileDialog user={appUser} onProfileUpdate={handleProfileUpdate}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </EditProfileDialog>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            <Calendar className="mr-2 h-4 w-4" />
            Sesiones Activas
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial de Sesiones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isPsychologist ? "Usuario" : "Psicólogo"}</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.length > 0 ? (
                    activeSessions.map(session => <SessionRow key={session.id} session={session} router={router} isPsychologist={!!isPsychologist}/>)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No hay sesiones activas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones Pasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isPsychologist ? "Usuario" : "Psicólogo"}</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {pastSessions.length > 0 ? (
                    pastSessions.map(session => <SessionRow key={session.id} session={session} router={router} isPsychologist={!!isPsychologist}/>)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No hay sesiones pasadas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
