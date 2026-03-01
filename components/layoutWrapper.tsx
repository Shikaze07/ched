"use client"

import { usePathname } from "next/navigation"
import NavHeader from "./nav-header"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function LayoutWrapper({ children }: Props) {
  const pathname = usePathname()

  // Add paths where NavHeader should NOT appear
  const hideNavOnPaths = [,"/register", "/admin/dashboard", "/admin/evaluation", "/admin/cmo", "/admin/program", "/admin/evaluation-checklist", "/admin/report"]

  const shouldHideNav = hideNavOnPaths.includes(pathname) || pathname.startsWith("/evaluation/")

  return (
    <>
      {!shouldHideNav && <NavHeader />}
      {children}
    </>
  )
}