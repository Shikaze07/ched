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
  const hideNavOnPaths = ["/login", "/register", "/admin/dashboard"]

  const shouldHideNav = hideNavOnPaths.includes(pathname)

  return (
    <>
      {!shouldHideNav && <NavHeader />}
      {children}
    </>
  )
}