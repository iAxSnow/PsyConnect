// @/app/dashboard/layout.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  User,
  BookUser,
  LogOut,
  X
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
  useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { SheetTitle } from "@/components/ui/sheet"

function CloseSidebarButton() {
    const { toggleSidebar } = useSidebar();
    return (
         <Button variant="ghost" size="icon" onClick={() => toggleSidebar()} className="h-8 w-8 absolute top-4 right-4 z-10">
            <X/>
            <span className="sr-only">Cerrar Menú</span>
        </Button>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, loading, error] = useAuthState(auth)

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error de autenticación",
        description: "Hubo un problema con tu sesión.",
        variant: "destructive",
      })
    }
  }, [error, toast]);


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
    { href: "/profile", icon: User, label: "Perfil" },
    { href: "/become-tutor", icon: BookUser, label: "Conviértete en Tutor" },
  ]

  const getPageTitle = () => {
    if (pathname === '/dashboard') return "Panel";
    const item = navItems.find(item => pathname.startsWith(item.href));
    if (item) return item.label;
    if (pathname.startsWith('/tutors/')) return "Perfil del Tutor";
    return "Panel";
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SidebarHeader>
            <CloseSidebarButton />
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
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
