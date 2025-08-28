// @/app/dashboard/page.tsx
"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"

import { Input } from "@/components/ui/input"
import { PsychologistCard } from "@/components/dashboard/psychologist-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [psychologists, setPsychologists] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchPsychologists = async () => {
      setIsLoading(true)
      try {
        const usersCollection = collection(db, "users")
        const q = query(usersCollection, where("isTutor", "==", true)) // isTutor is legacy for psychologist
        const psychologistsSnapshot = await getDocs(q)
        const psychologistsList = psychologistsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
        setPsychologists(psychologistsList)
      } catch (error) {
        console.error("Error fetching psychologists:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPsychologists()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Encuentra a tu psicólogo</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por especialidad o psicólogo..."
            className="w-full rounded-lg bg-card pl-10"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Psicólogos Destacados</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {psychologists.map((psychologist) => (
              <PsychologistCard key={psychologist.id} psychologist={psychologist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
