// @/components/dashboard/user-dashboard.tsx
"use client"

import * as React from "react"
import { Search, Sparkles, Send } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { suggestSpecialty } from "@/app/actions"

import { Input } from "@/components/ui/input"
import { PsychologistCard } from "@/components/dashboard/psychologist-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function AIAssistant({ onSpecialtySuggest }: { onSpecialtySuggest: (specialty: string) => void }) {
  const [problem, setProblem] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem.trim()) return
    
    setIsLoading(true)
    
    const result = await suggestSpecialty({ problemDescription: problem })
    setIsLoading(false)

    if (result.success && result.data) {
      onSpecialtySuggest(result.data.specialty)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">Sugerencia de la IA</span>
          </div>
        ),
        description: result.data.reasoning,
      })
      setProblem("") // Clear input after successful suggestion
    } else {
      toast({
        title: "Error de la IA",
        description: result.error || "No se pudo obtener una sugerencia. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
       <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
             <AvatarFallback><Sparkles className="h-5 w-5"/></AvatarFallback>
           </Avatar>
           <div>
            <h3 className="text-lg font-bold">Asistente IA</h3>
            <p className="text-muted-foreground text-sm">
                ¿No sabes por dónde empezar? Describe tu problema y te recomendaré una especialidad.
            </p>
           </div>
       </div>

       <form onSubmit={handleSubmit} className="flex items-center gap-2">
         <Input
            placeholder="Ej: 'Siento mucha ansiedad en el trabajo...'"
            className="flex-1"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send />
          </Button>
       </form>
    </div>
  )
}

export function UserDashboard() {
  const [psychologists, setPsychologists] = React.useState<User[]>([])
  const [filteredPsychologists, setFilteredPsychologists] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const fetchPsychologists = async () => {
      setIsLoading(true)
      try {
        const usersCollection = collection(db, "users")
        const q = query(usersCollection, where("isTutor", "==", true))
        const psychologistsSnapshot = await getDocs(q)
        const psychologistsList = psychologistsSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))
        setPsychologists(psychologistsList)
        setFilteredPsychologists(psychologistsList)
      } catch (error) {
        console.error("Error fetching psychologists:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPsychologists()
  }, [])

  React.useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = psychologists.filter(item => {
      return (
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.courses?.some(course => course.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredPsychologists(filteredData);
  }, [searchTerm, psychologists]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }

  const handleSpecialtySuggestion = (specialty: string) => {
    setSearchTerm(specialty);
  };

  return (
    <div className="space-y-8">
      <AIAssistant onSpecialtySuggest={handleSpecialtySuggestion} />

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Encuentra a tu psicólogo</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por especialidad o psicólogo..."
            className="w-full rounded-lg bg-card pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">
          {searchTerm ? `Resultados para "${searchTerm}"` : 'Psicólogos Destacados'}
        </h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : filteredPsychologists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPsychologists.map((psychologist) => (
              <PsychologistCard key={psychologist.uid} psychologist={psychologist} />
            ))}
          </div>
        ) : (
            <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-medium text-muted-foreground">No se encontraron psicólogos</h3>
                <p className="text-sm text-muted-foreground mt-2">Intenta con otra búsqueda o borra los filtros.</p>
            </div>
        )}
      </div>
    </div>
  )
}
