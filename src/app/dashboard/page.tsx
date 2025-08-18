// @/app/dashboard/page.tsx
"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"

import { Input } from "@/components/ui/input"
import { TutorCard } from "@/components/dashboard/tutor-card"
import { AITutorSuggester } from "@/components/dashboard/ai-tutor-suggester"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [tutors, setTutors] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true)
      try {
        const usersCollection = collection(db, "users")
        const q = query(usersCollection, where("isTutor", "==", true))
        const tutorsSnapshot = await getDocs(q)
        const tutorsList = tutorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
        setTutors(tutorsList)
      } catch (error) {
        console.error("Error fetching tutors:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTutors()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">¡Bienvenido de vuelta!</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos o tutores..."
            className="w-full rounded-lg bg-card pl-10"
          />
        </div>
      </div>
      
      <AITutorSuggester />

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Tutores Destacados</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
