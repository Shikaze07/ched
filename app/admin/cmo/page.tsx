"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Cmo } from "@prisma/client"
import { toast } from "sonner"

export default function CmoPage() {
    const [data, setData] = React.useState<Cmo[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/cmo")
            const cmos = await response.json()
            setData(cmos)
        } catch (error) {
            console.error("Error fetching CMOs:", error)
            toast.error("Failed to load CMOs")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/cmo?id=${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                toast.success("CMO deleted")
                fetchData()
            } else {
                toast.error("Failed to delete CMO")
            }
        } catch (error) {
            console.error("Error deleting CMO:", error)
            toast.error("Error deleting CMO")
        }
    }

    const tableRef = React.useRef<any>(null)

    const columns = getColumns({
        onEdit: (cmo) => {
            // We need to trigger the modal in DataTable. 
            // I will update DataTable to expose this via a ref.
            if (tableRef.current) {
                tableRef.current.openEditModal(cmo)
            }
        },
        onDelete: (id) => {
            if (window.confirm("Are you sure you want to delete this CMO?")) {
                handleDelete(id)
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
                <div className="flex h-24 items-center justify-center">Loading CMOs...</div>
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
