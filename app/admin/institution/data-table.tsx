"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Plus, Save, Loader2, Trash2 } from "lucide-react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    openDeleteModal: (institution: Institution) => void
}

export const DataTable = React.forwardRef<DataTableRef, DataTableProps<any, any>>(
    ({ columns, data, onRefresh }, ref) => {
        const [globalFilter, setGlobalFilter] = React.useState("")
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
        const [isSubmitting, setIsSubmitting] = React.useState(false)
        const [editingInstitution, setEditingInstitution] = React.useState<Partial<Institution> | null>(null)
        const [institutionToDelete, setInstitutionToDelete] = React.useState<Institution | null>(null)

        React.useImperativeHandle(ref, () => ({
            openEditModal: (institution: Institution) => {
                setEditingInstitution(institution)
                setIsModalOpen(true)
            },
            openDeleteModal: (institution: Institution) => {
                setInstitutionToDelete(institution)
                setIsDeleteModalOpen(true)
            }
        }))

        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
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
                <div className="flex items-center justify-between py-4 gap-4">
                    <div className="flex flex-1 items-center gap-4">
                        <Input
                            placeholder="Search institutions..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => {
                            setEditingInstitution({ name: "", address: "" })
                            setIsModalOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Institution
                        </Button>
                    </div>
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

                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} institution(s) total
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium mr-4">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        {(() => {
                            const pageCount = table.getPageCount()
                            const currentPage = table.getState().pagination.pageIndex + 1
                            const pages = []

                            if (pageCount <= 7) {
                                for (let i = 1; i <= pageCount; i++) pages.push(i)
                            } else {
                                if (currentPage <= 4) {
                                    pages.push(1, 2, 3, 4, 5, "...", pageCount)
                                } else if (currentPage >= pageCount - 3) {
                                    pages.push(1, "...", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount)
                                } else {
                                    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", pageCount)
                                }
                            }

                            return pages.map((page, index) => (
                                <Button
                                    key={index}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => typeof page === "number" && table.setPageIndex(page - 1)}
                                    disabled={typeof page !== "number"}
                                    className="w-9 h-9 p-0"
                                >
                                    {page}
                                </Button>
                            ))
                        })()}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={(editingInstitution as any)?.address || ""}
                                    onChange={(e) => setEditingInstitution({ ...editingInstitution, address: e.target.value })}
                                    placeholder="e.g. Ditsaan-ramain, Lanao Del Sur"
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
                
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Institution</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete <strong>{institutionToDelete?.name}</strong>?</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This action cannot be undone. This will permanently delete the institution and all associated data.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={async () => {
                                    if (institutionToDelete) {
                                        setIsSubmitting(true)
                                        try {
                                            const response = await fetch(`/api/institution?id=${institutionToDelete.id}`, {
                                                method: "DELETE",
                                            })
                                            if (response.ok) {
                                                toast.success("Institution deleted")
                                                setIsDeleteModalOpen(false)
                                                onRefresh()
                                            } else {
                                                toast.error("Failed to delete institution")
                                            }
                                        } catch (error) {
                                            console.error("Error deleting institution:", error)
                                            toast.error("Error deleting institution")
                                        } finally {
                                            setIsSubmitting(false)
                                        }
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        )
    }
)

DataTable.displayName = "DataTable"
