import React, { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Layout({ children }: { children: ReactNode }) {
    // Defense-in-depth: middleware is the primary gate, but this server-side
    // check ensures protection even if middleware is bypassed or misconfigured.
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user.isAdmin) {
        redirect("/login");
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            {/* Client-side guard: handles bfcache back-button and multi-tab logout */}
            <AdminAuthGuard />
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 m-2">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}