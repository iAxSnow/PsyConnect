// @/app/profile/page.tsx
"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, Calendar, History, Star, ArrowLeft } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import type { Session, User as AppUser } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, loadingAuth, errorAuth] = useAuthState(auth)
  const [appUser, setAppUser] = React.useState<AppUser | null>(null);
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loadingData, setLoadingData] = React.useState(true)
  
  React.useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoadingData(true)
        try {
          // Fetch user data from firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
              setAppUser({ id: userDoc.id, ...userDoc.data() } as AppUser);
          }

          // Fetch sessions
          const sessionsList = await getStudentSessions(user.uid)
          setSessions(sessionsList)
        } catch (error) {
          console.error("Error fetching user data or sessions: ", error)
        } finally {
          setLoadingData(false)
        }
      }
      fetchData()
    } else if (!loadingAuth) {
        router.push("/")
    }
  }, [user, loadingAuth, router])

  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status !== 'scheduled');

  const SessionRow = ({ session }: { session: Session }) => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={session.tutor.imageUrl} alt={session.tutor.name} data-ai-hint="person" />
            <AvatarFallback>{session.tutor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{session.tutor.name}</div>
            <div className="text-sm text-muted-foreground">{session.course}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
      <TableCell>
        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="capitalize bg-green-100 text-green-800">
            {session.status === 'completed' ? 'Completada' : (session.status === 'scheduled' ? 'Programada' : 'Cancelada')}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {session.status === 'completed' && <RatingDialog />}
      </TableCell>
    </TableRow>
  )
  
  if (loadingAuth || loadingData || !user || !appUser) {
    return (
        <div className="space-y-6">
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
                    <Skeleton className="h-5 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  const isPsychologist = appUser.isTutor;

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
              src={appUser.imageUrl || 'https://placehold.co/200x200.png'}
              alt="User profile picture"
              fill
              className="object-cover"
              data-ai-hint="person student"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{appUser.name}</h2>
            <p className="text-muted-foreground">{appUser.email}</p>
             {isPsychologist && <Badge className="mt-2">Psicólogo</Badge>}
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="scheduled">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scheduled">
            <Calendar className="mr-2 h-4 w-4" />
            Próximas Sesiones
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial de Sesiones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Sesiones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isPsychologist ? "Usuario" : "Psicólogo"}</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingData ? (
                     <TableRow><TableCell colSpan={4} className="text-center h-24"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ) : scheduledSessions.length > 0 ? (
                    scheduledSessions.map(session => <SessionRow key={session.id} session={session} />)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No hay próximas sesiones.
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
                   {loadingData ? (
                     <TableRow><TableCell colSpan={4} className="text-center h-24"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                   ) : pastSessions.length > 0 ? (
                    pastSessions.map(session => <SessionRow key={session.id} session={session} />)
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
