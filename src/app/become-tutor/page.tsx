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
        title: "Application Submitted!",
        description: "We've received your application and will review it shortly."
    })
    setStep(totalSteps + 1); // Go to success screen
  }

  const Step1 = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Certificates or Transcripts</Label>
            <Input type="file" multiple/>
            <p className="text-sm text-muted-foreground">Upload documents to verify your expertise.</p>
        </div>
    </div>
  )

  const Step2 = () => (
    <div className="space-y-4">
        <Label>Courses You Can Teach</Label>
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
            <Label htmlFor="rate">Hourly Rate ($)</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="rate" type="number" placeholder="25" className="pl-10" />
            </div>
        </div>
    </div>
  )

  const Step4 = () => (
    <div className="text-center">
        <h3 className="text-lg font-semibold">Review Your Application</h3>
        <p className="text-muted-foreground mt-2">Please review your information before submitting.</p>
        {/* In a real app, you would display a summary of the entered data here. */}
        <Card className="mt-4 text-left p-4 space-y-2">
            <p><strong>Certificates:</strong> 2 files uploaded</p>
            <p><strong>Courses:</strong> Introduction to Computer Science, Calculus II</p>
            <p><strong>Hourly Rate:</strong> $25/hr</p>
        </Card>
    </div>
  )
  
  const SuccessScreen = () => (
     <div className="text-center py-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Application Submitted!</h3>
        <p className="text-muted-foreground mt-2">Thank you. We will review your application and get back to you within 3-5 business days.</p>
        <Button onClick={() => setStep(1)} className="mt-6">Start Over</Button>
    </div>
  )

  const stepsContent = [
      { title: "Verify Expertise", description: "Upload relevant documents.", icon: Upload, content: <Step1/> },
      { title: "Select Courses", description: "Choose the subjects you'll teach.", icon: BookOpen, content: <Step2/> },
      { title: "Set Your Price", description: "Define your hourly rate for sessions.", icon: DollarSign, content: <Step3/> },
      { title: "Final Review", description: "Confirm your application details.", icon: Check, content: <Step4/> },
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
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {step < totalSteps ? (
                         <Button onClick={nextStep}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit}>Submit Application</Button>
                    )}
                </div>
            </>
        )}
    </Card>
  )
}
