// @/app/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <AuthLayout>
        <div className="space-y-6">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
            <div className="space-y-4 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
      </AuthLayout>
    )
  }
  
  // Only show the login form if the user is not logged in and auth state is loaded
  if (!user) {
    return (
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    )
  }
  
  // If user is logged in but useEffect hasn't redirected yet, show a loading state
  return (
     <AuthLayout>
        <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-muted-foreground">Redirigiendo a tu panel...</p>
        </div>
      </AuthLayout>
  );
}
