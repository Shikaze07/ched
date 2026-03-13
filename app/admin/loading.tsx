import * as React from "react"

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-medium tracking-tight animate-pulse">Loading...</p>
                <p className="text-sm text-muted-foreground">Please wait while we prepare your dashboard.</p>
            </div>
        </div>
    )
}
