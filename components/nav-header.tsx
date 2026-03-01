"use client"

import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function NavHeader() {
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session;

    return (
        <header className="sticky top-0 z-50 border-b"
            style={{ backgroundColor: '#2980b9' }}>
            <div className="flex h-14 items-center justify-between px-4 w-full">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold">
                        <Image src="/ched-logo.png" alt="CHED Logo" width={50} height={50} />
                    </div>

                    <div className="leading-tight">
                        <h1 className="text-sm font-medium text-white">
                            COMMISSION ON HIGHER EDUCATION - REGIONAL OFFICE XIII
                        </h1>
                        <p className="text-xs text-gray-200">
                            PROGRAM EVALUATION SELF ASSESSMENT
                        </p>
                    </div>
                </div>

                {/* Right side */}
                {isLoggedIn ? (
                    <Link href="/admin/dashboard">
                        <Button className="text-white" variant="ghost" size="sm">
                            Go back to Dashboard
                        </Button>
                    </Link>
                ) : (
                    <Link href="/login">
                        <Button className="text-white" variant="ghost" size="sm">
                            Login
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}