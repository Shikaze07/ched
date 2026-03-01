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
                <div className="flex items-center justify-between py-4">
                    <Input
                        placeholder="Search programs..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => {
                        setEditingProgram({ code: "", name: "" })
                        setIsModalOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Program
                    </Button>
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
