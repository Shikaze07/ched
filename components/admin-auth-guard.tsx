"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

/**
 * Client-side guard against two bfcache / session-expiry scenarios:
 *
 * 1. `pageshow` with event.persisted — bfcache restore (browser Back button).
 *    We immediately render an opaque cover so the admin page is never visible,
 *    then redirect to /login.
 *
 * 2. Session disappears while on an admin page (e.g. logout in another tab).
 *    We redirect to /login as soon as authClient detects the session is gone.
 */
export function AdminAuthGuard() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()
    const [isRestored, setIsRestored] = useState(false)

    // Redirect if session is gone (handles multi-tab logout)
    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/program-assessment")
        }
    }, [session, isPending, router])

    // On bfcache restore: instantly cover the page, then redirect
    useEffect(() => {
        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                // Show cover immediately — before any re-render can flash content
                setIsRestored(true)
                router.replace("/login")
            }
        }
        window.addEventListener("pageshow", handlePageShow)
        return () => window.removeEventListener("pageshow", handlePageShow)
    }, [router])

    if (!isRestored) return null

    // Full-screen opaque cover shown during the bfcache → /login redirect
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

