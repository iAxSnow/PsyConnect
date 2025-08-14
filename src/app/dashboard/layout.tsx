// @/app/dashboard/layout.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  User,
  BookUser,
  LogOut,
  Menu,
} from "lucide-react"

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
import { Logo } from "@/components/logo"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Panel" },
    { href: "/profile", icon: User, label: "Perfil" },
    { href: "/become-tutor", icon: BookUser, label: "Conviértete en Tutor" },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
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
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                 <Link href="/">
                    <SidebarMenuButton>
                        <LogOut/>
                        <span>Cerrar Sesión</span>
                    </SidebarMenuButton>
                 </Link>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.href === pathname)?.label || "Panel"}
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
