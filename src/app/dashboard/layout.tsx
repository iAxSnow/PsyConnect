// @/app/dashboard/layout.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  LogOut,
  PanelLeft,
  Shield,
  ArrowLeft
} from "lucide-react"
import { signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { SheetTitle } from "@/components/ui/sheet"


const ADMIN_EMAIL = "student.test@gmail.com";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, loading, error] = useAuthState(auth)
  const [isPsychologist, setIsPsychologist] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error de autenticación",
        description: "Hubo un problema con tu sesión.",
        variant: "destructive",
      })
    }
  }, [error, toast]);

  React.useEffect(() => {
    const checkUserRole = async () => {
        if (user) {
            // Check for admin role first
            if (user.email === ADMIN_EMAIL) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }

            // Check for psychologist role
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isTutor) {
                    setIsPsychologist(true);
                } else {
                    setIsPsychologist(false);
                }
            } catch (e) {
                console.error("Error fetching user role from Firestore:", e);
                setIsPsychologist(false);
            }
        } else if (!loading) {
            // Reset roles if user logs out or is not loaded
            setIsAdmin(false);
            setIsPsychologist(false);
        }
    }
    checkUserRole();
  }, [user, loading])


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión exitosamente."
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive"
      })
    }
  }

  const navItems = [
    { href: "/dashboard", icon: PanelLeft, label: "Panel", psychologistOnly: false, adminOnly: false },
    { href: "/profile", icon: User, label: "Perfil", psychologistOnly: false, adminOnly: false },
    { href: "/dashboard/admin", icon: Shield, label: "Panel de Administrador", psychologistOnly: false, adminOnly: true }
  ]

  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Panel";
    if (pathname === '/dashboard/admin') return "Panel de Administrador";
    if (pathname.startsWith('/dashboard/admin/reports/')) return "Detalle del Reporte";
    const item = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');
    if (item) return item.label;
    if (pathname.startsWith('/psychologists/')) return "Perfil del Psicólogo";
    if (pathname.startsWith('/sessions/')) return "Sala de Sesión";
    return "Panel";
  }
  
  const showBackButton = pathname.startsWith('/dashboard/admin/reports/');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.filter(item => {
                if(item.adminOnly) return isAdmin;
                if(isPsychologist) return true;
                return !item.psychologistOnly;
              }).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href) && item.href !== "/"}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut}>
                        <LogOut/>
                        <span>Cerrar Sesión</span>
                    </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
             {showBackButton && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft />
              </Button>
            )}
            <h1 className="text-lg font-semibold">
              {getPageTitle()}
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
