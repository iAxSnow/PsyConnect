// @/app/become-tutor/page.tsx
"use client"

import * as React from "react"
import { ArrowLeft, Check, Upload, BookOpen, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const totalSteps = 4

export default function BecomeTutorPage() {
  const [step, setStep] = React.useState(1)
  const { toast } = useToast()

  const nextStep = () => setStep((prev) => (prev < totalSteps ? prev + 1 : prev))
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev))

  const handleSubmit = () => {
    toast({
        title: "¡Solicitud Enviada!",
        description: "Hemos recibido tu solicitud y la revisaremos en breve."
    })
    setStep(totalSteps + 1); // Ir a la pantalla de éxito
  }

  const Step1 = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Certificados o Expedientes Académicos</Label>
            <Input type="file" multiple/>
            <p className="text-sm text-muted-foreground">Sube documentos para verificar tu experiencia.</p>
        </div>
    </div>
  )

  const Step2 = () => (
    <div className="space-y-4">
        <Label>Cursos que Puedes Enseñar</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {courses.map(course => (
                 <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox id={course.id} />
                    <label htmlFor={course.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       {course.name}
                    </label>
                </div>
            ))}
        </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="rate">Tarifa por Hora (CLP)</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="rate" type="number" placeholder="10000" className="pl-10" />
            </div>
        </div>
    </div>
  )

  const Step4 = () => (
    <div className="text-center">
        <h3 className="text-lg font-semibold">Revisa tu Solicitud</h3>
        <p className="text-muted-foreground mt-2">Por favor, revisa tu información antes de enviarla.</p>
        {/* En una aplicación real, aquí se mostraría un resumen de los datos ingresados. */}
        <Card className="mt-4 text-left p-4 space-y-2">
            <p><strong>Certificados:</strong> 2 archivos subidos</p>
            <p><strong>Cursos:</strong> Programación, Cálculo II</p>
            <p><strong>Tarifa por Hora:</strong> $10.000/hr</p>
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
        <Button onClick={() => setStep(1)} className="mt-6">Empezar de Nuevo</Button>
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <currentStepInfo.icon className="h-6 w-6"/>
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
