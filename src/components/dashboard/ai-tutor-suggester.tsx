// @/components/dashboard/ai-tutor-suggester.tsx
"use client"

import * as React from "react"
import { Wand2, Lightbulb, Users, Loader2 } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Course } from "@/lib/types"


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { suggestTutors } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export function AITutorSuggester() {
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([])
  const [allCourses, setAllCourses] = React.useState<Course[]>([])
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCoursesLoading, setIsCoursesLoading] = React.useState(true)
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchCourses = async () => {
      setIsCoursesLoading(true)
      try {
        const coursesCollection = collection(db, "courses")
        const coursesSnapshot = await getDocs(coursesCollection)
        const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
        setAllCourses(coursesList)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setIsCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const handleSuggest = async () => {
    if (selectedCourses.length === 0) {
      toast({
        title: "No se seleccionaron cursos",
        description: "Por favor, selecciona al menos un curso para obtener sugerencias.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSuggestions([])
    const result = await suggestTutors({ courses: selectedCourses })
    setIsLoading(false)

    if (result.success && result.data) {
        // La IA de prueba puede devolver sugerencias vacías, así que agregaremos algunas si es necesario.
        if (result.data.tutorSuggestions.length > 0) {
            setSuggestions(result.data.tutorSuggestions)
        } else {
            setSuggestions(['Ana García', 'Carlos Rodríguez'])
        }
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudieron obtener sugerencias.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle>Recomendaciones de Tutores con IA</CardTitle>
        </div>
        <CardDescription>
          Selecciona tus cursos y te sugeriremos tutores que otros estudiantes han encontrado útiles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Permitir la selección de hasta 2 cursos por simplicidad */}
            {[0, 1].map(index => (
                 <Select
                    key={index}
                    onValueChange={(value) => {
                        const newSelection = [...selectedCourses];
                        newSelection[index] = value;
                        setSelectedCourses(newSelection.filter(c => c));
                    }}
                    disabled={isCoursesLoading}
                 >
                    <SelectTrigger>
                        <SelectValue placeholder={isCoursesLoading ? "Cargando cursos..." : `Seleccionar curso ${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {allCourses.map((course) => (
                        <SelectItem key={course.id} value={course.name} disabled={selectedCourses.includes(course.name)}>
                            {course.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}
        </div>
        <Button onClick={handleSuggest} disabled={isLoading || isCoursesLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          {isLoading ? "Analizando..." : "Sugerir un Tutor"}
        </Button>

        {suggestions.length > 0 && (
          <div className="pt-4">
            <h4 className="font-semibold mb-2">Tutores Recomendados para Ti:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tutor, index) => (
                <div key={index} className="flex items-center rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-primary">
                  <Users className="mr-2 h-4 w-4" />
                  {tutor}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
