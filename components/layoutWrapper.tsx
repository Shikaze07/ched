"use client"

import { usePathname } from "next/navigation"
import NavHeader from "./nav-header"
import { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

interface Props {
  children: ReactNode
}

export default function LayoutWrapper({ children }: Props) {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.isAdmin

  // Paths where NavHeader should NOT appear for anyone (e.g., Auth pages)
  const alwaysHideNavOn = ["/register", "/error", "/login"]

  // Logic: 
  // 1. Always hide on explicit paths
  // 2. Always hide on /admin routes (they have their own Sidebar/Header)
  // 3. For /evaluation/ paths, hide ONLY if the user is an admin
  const shouldHideNav =
    alwaysHideNavOn.includes(pathname) ||
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/evaluation/") && isAdmin)

  return (
    <>
      {!shouldHideNav && <NavHeader />}
      {children}
    </>
  )
}