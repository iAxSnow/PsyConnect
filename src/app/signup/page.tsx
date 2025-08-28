// @/app/signup/page.tsx
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, User, Stethoscope } from "lucide-react";

export default function SignupPage() {
  return (
    <AuthLayout>
        <div className="w-full space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Únete a PsyConnect</h1>
                <p className="text-muted-foreground">
                    Elige tu tipo de cuenta para comenzar.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <Link href="/signup/user">
                    <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                           <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="h-6 w-6 text-primary"/>
                           </div>
                           <CardTitle className="text-lg">Soy un Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Busca y contacta psicólogos de forma anónima y segura.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/signup/psychologist">
                     <Card className="hover:bg-accent/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Stethoscope className="h-6 w-6 text-primary"/>
                            </div>
                           <CardTitle className="text-lg">Soy un Psicólogo</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground">
                                Ofrece tus servicios y conecta con personas que necesitan ayuda.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
             <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
                    Iniciar Sesión
                </Link>
             </div>
        </div>
    </AuthLayout>
  );
}
