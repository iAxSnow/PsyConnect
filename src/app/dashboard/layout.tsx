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
  ArrowLeft,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
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


const ADMIN_EMAIL = "admin@connect.udp.cl";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, loading, error] = useAuthState(auth)
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
    if (user) {
        setIsAdmin(user.email === ADMIN_EMAIL);
    } else if (!loading) {
        // Reset roles if user logs out or is not loaded
        setIsAdmin(false);
    }
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
    { href: "/dashboard", icon: PanelLeft, label: "Panel" },
    { href: "/profile", icon: User, label: "Perfil" },
  ];
  
  const adminNavItems = [
     { href: "/dashboard/admin", icon: Shield, label: "Panel de Admin" }
  ]

  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Panel";
    if (pathname.startsWith('/dashboard/admin')) return "Panel de Administrador";
    if (pathname.startsWith('/dashboard/admin/reports/')) return "Detalle del Reporte";
    if (pathname.startsWith('/dashboard/admin/users/')) return "Detalle de Usuario";
    const item = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');
    if (item) return item.label;
    if (pathname.startsWith('/psychologists/')) return "Perfil del Psicólogo";
    if (pathname.startsWith('/sessions/')) return "Sala de Sesión";
    return "Panel";
  }
  
  const showBackButton = pathname.startsWith('/dashboard/admin/reports/') || pathname.startsWith('/dashboard/admin/users/');

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <>
                <SidebarMenuItem>
                    <div className="p-3 pt-6 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                        Admin
                    </div>
                </SidebarMenuItem>
                {adminNavItems.map(item => (
                     <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            >
                            <item.icon />
                            <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
                </>
              )}
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
