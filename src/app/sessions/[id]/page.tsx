// @/app/sessions/[id]/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionPage() {
  const router = useRouter()
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info /> Página Deshabilitada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Esta página de chat ya no está en uso. La comunicación entre usuarios y psicólogos ahora se realiza por correo electrónico.
                </p>
                <p className="text-muted-foreground">
                    Puedes ver el correo de contacto del psicólogo en la sección "Sesiones Activas" de tu perfil una vez que tu solicitud sea aceptada.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="mr-2"/>
                    Volver al Panel
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
