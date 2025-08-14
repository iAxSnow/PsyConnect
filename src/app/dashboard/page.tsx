// @/app/dashboard/page.tsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TutorCard } from "@/components/dashboard/tutor-card"
import { AITutorSuggester } from "@/components/dashboard/ai-tutor-suggester"
import { tutors } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">¡Bienvenido de vuelta, Estudiante!</h2>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      </div>
    </div>
  )
}
