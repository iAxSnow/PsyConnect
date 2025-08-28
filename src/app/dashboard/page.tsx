// @/app/dashboard/page.tsx
"use client"

import *d React from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/lib/types"

import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { PsychologistDashboard } from "@/components/dashboard/psychologist-dashboard"
import { Skeleton } from "@/components/ui/skeleton"


export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth)
  const [appUser, setAppUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setAppUser({ id: userDoc.id, ...userDoc.data() } as User);
          }
        } catch (error) {
            console.error("Error fetching user data:", error)
        } finally {
            setIsLoading(false)
        }
      } else if (!loadingAuth) {
        setIsLoading(false)
      }
    }
    fetchUserRole()
  }, [user, loadingAuth])
  
  if (isLoading || loadingAuth) {
    return (
        <div className="space-y-8">
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
                 <Skeleton className="h-8 w-1/3" />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (appUser?.isTutor) {
    return <PsychologistDashboard psychologistId={appUser.uid} />
  }

  return <UserDashboard />
}
