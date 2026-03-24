"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Program } from "@prisma/client"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function ProgramPage() {
    const [data, setData] = React.useState<Program[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchData = React.useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true)
        try {
            const response = await fetch("/api/programs")
            const programs = await response.json()
            setData(programs)
        } catch (error) {
            console.error("Error fetching programs:", error)
            toast.error("Failed to load programs")
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData(true)
    }, [fetchData])


    const tableRef = React.useRef<any>(null)

    const columns = getColumns({
        onEdit: (program) => {
            if (tableRef.current) {
                tableRef.current.openEditModal(program)
            }
        },
        onDelete: (program) => {
            if (tableRef.current) {
                tableRef.current.openDeleteModal(program)
            }
        }
    })

    return (


        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Program Management</h1>
                <p className="text-muted-foreground">
                    Manage Academic Programs and their unique identification codes.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading Programs...</p>
                </div>
            ) : (
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={data}
                    onRefresh={fetchData}
                />
            )}
        </div>
    )
}
