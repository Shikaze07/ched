"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import {authClient} from "@/lib/auth-client"
import { usePathname } from 'next/navigation'

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <AuthUIProvider
            authClient={authClient}
            navigate={router.push}
            replace={router.replace}
            onSessionChange={() => {
                // Clear router cache (protected routes)
                router.refresh()
                // If user just signed in via the auth UI, redirect them to dashboard
                try {
                    if (pathname && pathname.startsWith('/auth')) {
                        router.push('/dashboard')
                    }
                } catch (e) {
                    // noop
                }
            }}
            Link={Link}
        >
            {children}
        </AuthUIProvider>
    )
}