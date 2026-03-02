"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Plus, Save, Loader2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Institution } from "@prisma/client"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh: () => void
}

export interface DataTableRef {
    openEditModal: (institution: Institution) => void
}

export const DataTable = React.forwardRef<DataTableRef, DataTableProps<any, any>>(
    ({ columns, data, onRefresh }, ref) => {
        const [globalFilter, setGlobalFilter] = React.useState("")
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        const [isSubmitting, setIsSubmitting] = React.useState(false)
        const [editingInstitution, setEditingInstitution] = React.useState<Partial<Institution> | null>(null)

        React.useImperativeHandle(ref, () => ({
            openEditModal: (institution: Institution) => {
                setEditingInstitution(institution)
                setIsModalOpen(true)
            }
        }))

        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            onGlobalFilterChange: setGlobalFilter,
            state: { globalFilter },
        })

        const handleSave = async (e: React.FormEvent) => {
            e.preventDefault()
            if (!editingInstitution?.name) {
                toast.error("Institution name is required")
                return
            }
            setIsSubmitting(true)
            try {
                const response = await fetch("/api/institution", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingInstitution),
                })
                if (response.ok) {
                    toast.success(editingInstitution.id ? "Institution updated" : "Institution created")
                    setIsModalOpen(false)
                    onRefresh()
                } else {
                    toast.error("Failed to save institution")
                }
            } catch (error) {
                console.error("Error saving institution:", error)
                toast.error("Error saving institution")
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <div>
                <div className="flex items-center justify-between py-4">
                    <Input
                        placeholder="Search institutions..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => {
                        setEditingInstitution({ name: "" })
                        setIsModalOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Institution
                    </Button>
                </div>

                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No institutions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingInstitution?.id ? "Edit Institution" : "Add New Institution"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Institution Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    value={editingInstitution?.name || ""}
                                    onChange={(e) => setEditingInstitution({ ...editingInstitution, name: e.target.value })}
                                    placeholder="e.g. University of Manila"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        : <Save className="mr-2 h-4 w-4" />}
                                    {editingInstitution?.id ? "Update" : "Save"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
)

DataTable.displayName = "DataTable"
