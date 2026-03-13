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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Program } from "@prisma/client"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh: () => void
}

export const DataTable = React.forwardRef<DataTableRef, DataTableProps<any, any>>(
    ({ columns, data, onRefresh }, ref) => {
        const [globalFilter, setGlobalFilter] = React.useState("")
        const [isModalOpen, setIsModalOpen] = React.useState(false)
        const [isSubmitting, setIsSubmitting] = React.useState(false)
        const [editingProgram, setEditingProgram] = React.useState<Partial<Program> | null>(null)

        React.useImperativeHandle(ref, () => ({
            openEditModal: (program: Program) => {
                setEditingProgram(program)
                setIsModalOpen(true)
            }
        }))

        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            onGlobalFilterChange: setGlobalFilter,
            state: {
                globalFilter,
            },
        })

        const handleSave = async (e: React.FormEvent) => {
            e.preventDefault()
            if (!editingProgram?.code || !editingProgram?.name) {
                toast.error("Please fill in all fields")
                return
            }

            setIsSubmitting(true)
            try {
                const response = await fetch("/api/programs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingProgram),
                })

                if (response.ok) {
                    toast.success(editingProgram.id ? "Program updated" : "Program created")
                    setIsModalOpen(false)
                    onRefresh()
                } else {
                    toast.error("Failed to save program")
                }
            } catch (error) {
                console.error("Error saving program:", error)
                toast.error("Error saving program")
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <div>
                <div className="flex items-center justify-between py-4 gap-4">
                    <div className="flex flex-1 items-center gap-4">
                        <Input
                            placeholder="Search programs..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
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
                            setEditingProgram({ code: "", name: "" })
                            setIsModalOpen(true)
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Program
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
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
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
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} program(s) total
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
                            <DialogTitle>{editingProgram?.id ? "Edit Program" : "Add New Program"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Program Code</Label>
                                <Input
                                    id="code"
                                    value={editingProgram?.code || ""}
                                    onChange={(e) => setEditingProgram({ ...editingProgram, code: e.target.value })}
                                    placeholder="e.g. BSIT"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Program Name</Label>
                                <Input
                                    id="name"
                                    value={editingProgram?.name || ""}
                                    onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                                    placeholder="e.g. Bachelor of Science in Information Technology"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {editingProgram?.id ? "Update" : "Save"}
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

export interface DataTableRef {
    openEditModal: (program: Program) => void
}
