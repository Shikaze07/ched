// app/auth/account-setting/page.tsx
"use client"

import { AccountSettingsCards } from "@daveyplate/better-auth-ui"

export default function AccountSettingPage() {
    return (
        <main className="flex justify-center items-start min-h-screen p-6">
            <div className="w-full max-w-3xl">
                <AccountSettingsCards />
            </div>
        </main>
    )
}