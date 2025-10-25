// @/app/sessions/[id]/page.tsx
"use client"

import * as React from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import Image from "next/image"
import { doc, getDoc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Send, ArrowLeft, Paperclip, Video, Phone, AlertCircle } from "lucide-react"

import { db, auth } from "@/lib/firebase"
import type { Session, User } from "@/lib/types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ReportDialog } from "@/components/report-dialog"


export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [currentUser, loadingAuth] = useAuthState(auth)
  
  const [session, setSession] = React.useState<Session | null>(null)
  const [otherUser, setOtherUser] = React.useState<User | null>(null)
  const [appUser, setAppUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  const sessionId = params.id as string

  React.useEffect(() => {
    if (!currentUser || !sessionId) return

    const sessionDocRef = doc(db, "sessions", sessionId)

    const unsubscribe = onSnapshot(sessionDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const sessionData = { id: docSnap.id, ...docSnap.data() } as Session
        
        // Security check: ensure current user is part of the session
        if (sessionData.studentId !== currentUser.uid && sessionData.tutorId !== currentUser.uid) {
            console.error("Access denied: User is not part of this session.");
            notFound();
            return;
        }

        setSession(sessionData)

        // Fetch the other user's data for display
        const otherUserId = sessionData.studentId === currentUser.uid ? sessionData.tutorId : sessionData.studentId;
        const [otherUserDoc, appUserDoc] = await Promise.all([
            getDoc(doc(db, "users", otherUserId)),
            getDoc(doc(db, "users", currentUser.uid))
        ]);

        if (otherUserDoc.exists()) {
            setOtherUser({ uid: otherUserDoc.id, ...otherUserDoc.data() } as User);
        }
         if (appUserDoc.exists()) {
            setAppUser({ uid: appUserDoc.id, ...appUserDoc.data() } as User);
        }

        setLoading(false)
      } else {
        notFound()
      }
    });

    return () => unsubscribe()
  }, [sessionId, currentUser])

  if (loading || loadingAuth) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-1/2" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-3/4 self-start" />
          <Skeleton className="h-16 w-3/4 self-end" />
          <Skeleton className="h-16 w-3/4 self-start" />
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (!session || !otherUser || !appUser) {
    return notFound()
  }

  const isChatDisabled = session.status !== 'accepted'
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      <header className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <Avatar>
            <AvatarImage src={otherUser.imageUrl} alt={otherUser.name} data-ai-hint="person" />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{otherUser.name}</h2>
            <p className="text-sm text-muted-foreground">Sesión sobre: {session.course}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
             <ReportDialog reportedUser={otherUser} reporterUser={appUser}>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <AlertCircle className="mr-2 h-4 w-4" /> Reportar
                </Button>
             </ReportDialog>
            <Button variant="outline" size="icon" disabled={isChatDisabled}>
                <Phone/>
                <span className="sr-only">Llamar</span>
            </Button>
            <Button variant="outline" size="icon" disabled={isChatDisabled}>
                <Video/>
                <span className="sr-only">Videollamada</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Placeholder for chat messages */}
        <div className="flex justify-center text-center text-muted-foreground p-4">
            <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                    {isChatDisabled ? `Esperando Aceptación` : `Chat Habilitado`}
                </h3>
                <p className="text-sm">
                   {isChatDisabled 
                    ? `El chat se habilitará cuando ${session.tutor.name} acepte la solicitud.`
                    : `Ahora puedes coordinar los detalles de la sesión con ${otherUser.name}.`
                   }
                </p>
            </div>
        </div>
      </main>
      <footer className="p-4 border-t bg-background">
        <form className="flex items-center gap-2">
          <Button variant="ghost" size="icon" type="button" disabled={isChatDisabled}>
            <Paperclip/>
            <span className="sr-only">Adjuntar archivo</span>
          </Button>
          <Input placeholder={isChatDisabled ? "El chat está deshabilitado" : "Escribe un mensaje..."} disabled={isChatDisabled} />
          <Button type="submit" size="icon" disabled={isChatDisabled}>
            <Send />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
