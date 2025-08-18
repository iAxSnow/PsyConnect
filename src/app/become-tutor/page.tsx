// @/app/become-tutor/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Upload, BookOpen, DollarSign, Loader2 } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Course } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

const totalSteps = 4

export default function BecomeTutorPage() {
  const [step, setStep] = React.useState(1)
  const { toast } = useToast()
  const router = useRouter()

  // State for form data
  const [certificates, setCertificates] = React.useState<File[]>([])
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([])
  const [hourlyRate, setHourlyRate] = React.useState<string>("")
  const [allCourses, setAllCourses] = React.useState<Course[]>([])
  const [isCoursesLoading, setIsCoursesLoading] = React.useState(true)


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
        toast({
            title: "Error",
            description: "No se pudieron cargar los cursos.",
            variant: "destructive"
        })
      } finally {
        setIsCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [toast])


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCertificates(Array.from(e.target.files))
    }
  }

  const handleCourseChange = (courseName: string, checked: boolean) => {
    setSelectedCourses(prev =>
      checked ? [...prev, courseName] : prev.filter(name => name !== courseName)
    )
  }

  const nextStep = () => setStep((prev) => (prev < totalSteps ? prev + 1 : prev))
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev))

  const handleSubmit = () => {
    // Here you would typically send the data to your backend/Firebase
    console.log({
      certificates,
      selectedCourses,
      hourlyRate,
    })

    toast({
        title: "¡Solicitud Enviada!",
        description: "Hemos recibido tu solicitud y la revisaremos en breve."
    })
    setStep(totalSteps + 1); // Go to success screen
  }

  const Step1 = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="certificates">Certificados o Expedientes Académicos</Label>
            <Input id="certificates" type="file" multiple onChange={handleFileChange} />
            <p className="text-sm text-muted-foreground">Sube documentos para verificar tu experiencia.</p>
            {certificates.length > 0 && (
                <div className="text-sm text-muted-foreground space-y-1 pt-2">
                    <p className="font-medium">Archivos seleccionados:</p>
                    <ul className="list-disc pl-5">
                        {certificates.map(file => <li key={file.name}>{file.name}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </div>
  )

  const Step2 = () => (
    <div className="space-y-4">
        <Label>Cursos que Puedes Enseñar</Label>
        {isCoursesLoading ? (
             <div className="space-y-2 max-h-60">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
             </div>
        ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {allCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={course.id}
                            onCheckedChange={(checked) => handleCourseChange(course.name, !!checked)}
                            checked={selectedCourses.includes(course.name)}
                        />
                        <label htmlFor={course.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {course.name}
                        </label>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="rate">Tarifa por Hora (CLP)</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    id="rate" 
                    type="number" 
                    placeholder="10000" 
                    className="pl-10" 
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                />
            </div>
        </div>
    </div>
  )

  const Step4 = () => (
    <div className="text-center">
        <h3 className="text-lg font-semibold">Revisa tu Solicitud</h3>
        <p className="text-muted-foreground mt-2">Por favor, revisa tu información antes de enviarla.</p>
        <Card className="mt-4 text-left p-4 space-y-2">
            <p><strong>Certificados:</strong> {certificates.length > 0 ? `${certificates.length} archivo(s) subido(s)`: 'Ninguno'}</p>
            <p><strong>Cursos:</strong> {selectedCourses.length > 0 ? selectedCourses.join(', ') : 'Ninguno'}</p>
            <p><strong>Tarifa por Hora:</strong> {hourlyRate ? `$${Number(hourlyRate).toLocaleString('es-CL')}/hr` : 'No establecida'}</p>
        </Card>
    </div>
  )
  
  const SuccessScreen = () => (
     <div className="text-center py-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">¡Solicitud Enviada!</h3>
        <p className="text-muted-foreground mt-2">Gracias. Revisaremos tu solicitud y te responderemos en un plazo de 3 a 5 días hábiles.</p>
        <Button onClick={() => {
            setStep(1)
            setCertificates([])
            setSelectedCourses([])
            setHourlyRate("")
        }} className="mt-6">Empezar de Nuevo</Button>
    </div>
  )

  const stepsContent = [
      { title: "Verificar Experiencia", description: "Sube documentos relevantes.", icon: Upload, content: <Step1/> },
      { title: "Seleccionar Cursos", description: "Elige las materias que enseñarás.", icon: BookOpen, content: <Step2/> },
      { title: "Establecer tu Precio", description: "Define tu tarifa por hora para las sesiones.", icon: DollarSign, content: <Step3/> },
      { title: "Revisión Final", description: "Confirma los detalles de tu solicitud.", icon: Check, content: <Step4/> },
  ]

  const currentStepInfo = stepsContent[step - 1]

  return (
    <Card className="w-full max-w-2xl mx-auto">
        {step > totalSteps ? (
            <SuccessScreen/>
        ) : (
            <>
                <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                        {step === 1 && (
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                                <ArrowLeft />
                            </Button>
                        )}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                             {isCoursesLoading && currentStepInfo.icon === BookOpen ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <currentStepInfo.icon className="h-6 w-6"/>
                            )}
                        </div>
                        <div>
                            <CardTitle>{currentStepInfo.title}</CardTitle>
                            <CardDescription>{currentStepInfo.description}</CardDescription>
                        </div>
                    </div>
                    <Progress value={(step / totalSteps) * 100} className="w-full" />
                </CardHeader>
                <CardContent className="min-h-[250px]">
                    {currentStepInfo.content}
                </CardContent>
                <div className="flex justify-between p-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>
                    {step < totalSteps ? (
                         <Button onClick={nextStep}>Siguiente</Button>
                    ) : (
                        <Button onClick={handleSubmit}>Enviar Solicitud</Button>
                    )}
                </div>
            </>
        )}
    </Card>
  )
}
