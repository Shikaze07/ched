"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Cmo } from "@prisma/client"
import { toast } from "sonner"

export default function CmoPage() {
    const [data, setData] = React.useState<Cmo[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchData = React.useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true)
        try {
            const response = await fetch("/api/cmo")
            const cmos = await response.json()
            setData(cmos)
        } catch (error) {
            console.error("Error fetching CMOs:", error)
            toast.error("Failed to load CMOs")
        } finally {
            if (showLoading) setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData(true)
    }, [fetchData])


    const tableRef = React.useRef<any>(null)

    const columns = getColumns({
        onEdit: (cmo) => {
            // We need to trigger the modal in DataTable. 
            // I will update DataTable to expose this via a ref.
            if (tableRef.current) {
                tableRef.current.openEditModal(cmo)
            }
        },
        onDelete: (cmo) => {
            if (tableRef.current) {
                tableRef.current.openDeleteModal(cmo)
            }
        }
    })

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">CMO Management</h1>
                <p className="text-muted-foreground">
                    Manage CHED Memorandum Orders, titles, and effectiveness years.
                </p>
            </div>

            {isLoading ? (

                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading CMOs...</p>
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
