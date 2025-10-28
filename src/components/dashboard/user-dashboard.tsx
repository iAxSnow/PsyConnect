// @/components/dashboard/user-dashboard.tsx
"use client"

import * as React from "react"
import { Search, Sparkles, Send } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { suggestSpecialty } from "@/app/actions"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAvailableSpecialties } from "@/services/courses"

import { Input } from "@/components/ui/input"
import { PsychologistCard } from "@/components/dashboard/psychologist-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SessionStatus } from "@/components/dashboard/session-status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [user, loadingAuth] = useAuthState(auth)
  const [psychologists, setPsychologists] = React.useState<User[]>([])
  const [filteredPsychologists, setFilteredPsychologists] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [specialties, setSpecialties] = React.useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("all")
  const [priceRange, setPriceRange] = React.useState<string>("all")

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const usersCollection = collection(db, "users")
        const q = query(usersCollection, where("isTutor", "==", true))
        
        const [psychologistsSnapshot, availableSpecialties] = await Promise.all([
          getDocs(q),
          getAvailableSpecialties()
        ])

        const psychologistsList = psychologistsSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))
        
        setPsychologists(psychologistsList)
        setFilteredPsychologists(psychologistsList)
        setSpecialties(availableSpecialties)

      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

 React.useEffect(() => {
    let filteredData = [...psychologists];
    const lowercasedFilter = searchTerm.toLowerCase();

    // Text search filter
    if (lowercasedFilter) {
        filteredData = filteredData.filter(item => {
            return (
                item.name.toLowerCase().includes(lowercasedFilter) ||
                item.courses?.some(course => course.toLowerCase().includes(lowercasedFilter))
            );
        });
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
        filteredData = filteredData.filter(item => 
            item.courses?.includes(selectedSpecialty)
        );
    }
    
    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split('-').map(Number);
      filteredData = filteredData.filter(item => {
        const rate = item.hourlyRate || 0;
        return rate >= min && rate <= max;
      });
    }

    setFilteredPsychologists(filteredData);
  }, [searchTerm, selectedSpecialty, priceRange, psychologists]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }
  
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
  }

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
  }

  const handleSpecialtySuggestion = (specialty: string) => {
    const specialtyExists = specialties.includes(specialty);
    if(specialtyExists){
      setSelectedSpecialty(specialty);
    } else {
        setSearchTerm(specialty);
    }
  };

  return (
    <div className="space-y-8">
      <AIAssistant onSpecialtySuggest={handleSpecialtySuggestion} />
      
      {user && <SessionStatus userId={user.uid} />}

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Encuentra a tu psicólogo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative sm:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por especialidad o psicólogo..."
                className="w-full rounded-lg bg-card pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
             <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por especialidad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {specialties.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={handlePriceRangeChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por precio" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Seleccionar Precio</SelectItem>
                    <SelectItem value="0-40000">$0 - $40.000</SelectItem>
                    <SelectItem value="40001-70000">$40.001 - $70.000</SelectItem>
                    <SelectItem value="70001-100000">$70.001 - $100.000</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">
          {searchTerm || selectedSpecialty !== 'all' ? `Resultados de la Búsqueda` : 'Psicólogos Destacados'}
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
