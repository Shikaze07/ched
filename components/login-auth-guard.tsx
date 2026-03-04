"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

/**
 * Guards the /login page against:
 * 1. Already-authenticated admins navigating back via bfcache.
 * 2. Authenticated admins landing on /login while still logged in.
 *
 * Shows an opaque cover instantly on bfcache restore so the login form
 * is never visible during the redirect.
 */
export function LoginAuthGuard() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()
    const [isRestored, setIsRestored] = useState(false)

    // If already logged in as admin, skip the login page entirely
    useEffect(() => {
        if (!isPending && session?.user.isAdmin) {
            router.replace("/admin/dashboard")
        }
    }, [session, isPending, router])

    // On bfcache restore: cover immediately, then redirect to dashboard
    useEffect(() => {
        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                setIsRestored(true)
                router.replace("/admin/dashboard")
            }
        }
        window.addEventListener("pageshow", handlePageShow)
        return () => window.removeEventListener("pageshow", handlePageShow)
    }, [router])

    if (!isRestored) return null

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        border: "3px solid #e5e7eb",
                        borderTop: "3px solid #2980b9",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Redirecting…</p>
            </div>
        </div>
    )
}
