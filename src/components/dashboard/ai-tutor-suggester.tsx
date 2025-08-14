// @/components/dashboard/ai-tutor-suggester.tsx
"use client"

import * as React from "react"
import { Wand2, Lightbulb, Users, Loader2 } from "lucide-react"

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
import { courses as allCourses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export function AITutorSuggester() {
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([])
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSuggest = async () => {
    if (selectedCourses.length === 0) {
      toast({
        title: "No Courses Selected",
        description: "Please select at least one course to get suggestions.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSuggestions([])
    const result = await suggestTutors({ courses: selectedCourses })
    setIsLoading(false)

    if (result.success && result.data) {
        // The mock AI might return empty suggestions, so we'll add some if needed.
        if (result.data.tutorSuggestions.length > 0) {
            setSuggestions(result.data.tutorSuggestions)
        } else {
            setSuggestions(['Ana García', 'Carlos Rodríguez'])
        }
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to get suggestions.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle>AI Tutor Recommendations</CardTitle>
        </div>
        <CardDescription>
          Select your courses, and we'll suggest tutors that similar students have found helpful.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Allowing selection of up to 2 courses for simplicity */}
            {[0, 1].map(index => (
                 <Select
                    key={index}
                    onValueChange={(value) => {
                        const newSelection = [...selectedCourses];
                        newSelection[index] = value;
                        setSelectedCourses(newSelection.filter(c => c));
                    }}
                 >
                    <SelectTrigger>
                        <SelectValue placeholder={`Select course ${index + 1}`} />
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
        <Button onClick={handleSuggest} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          {isLoading ? "Analyzing..." : "Suggest a Tutor"}
        </Button>

        {suggestions.length > 0 && (
          <div className="pt-4">
            <h4 className="font-semibold mb-2">Recommended Tutors for You:</h4>
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
