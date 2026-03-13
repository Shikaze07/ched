"use client"

import * as React from "react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Institution } from "@prisma/client"
import { toast } from "sonner"

export default function InstitutionPage() {
    const [data, setData] = React.useState<Institution[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/institution")
            const institutions = await response.json()
            setData(institutions)
        } catch (error) {
            console.error("Error fetching institutions:", error)
            toast.error("Failed to load institutions")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/institution?id=${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                toast.success("Institution deleted")
                fetchData()
            } else {
                toast.error("Failed to delete institution")
            }
        } catch (error) {
            console.error("Error deleting institution:", error)
            toast.error("Error deleting institution")
        }
    }

    const tableRef = React.useRef<any>(null)

    const columns = getColumns({
        onEdit: (institution) => {
            if (tableRef.current) {
                tableRef.current.openEditModal(institution)
            }
        },
        onDelete: (id) => {
            if (window.confirm("Are you sure you want to delete this institution?")) {
                handleDelete(id)
            }
        }
    })

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Institution Management</h1>
                <p className="text-muted-foreground">
                    Manage Higher Education Institutions (HEIs) and their details.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading institutions...</p>
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