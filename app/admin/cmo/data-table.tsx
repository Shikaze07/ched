"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Cmo, Program } from "@prisma/client"

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
        const [editingCmo, setEditingCmo] = React.useState<any | null>(null)
        const [programs, setPrograms] = React.useState<Program[]>([])

        React.useEffect(() => {
            const fetchPrograms = async () => {
                try {
                    const response = await fetch("/api/programs")
                    const data = await response.json()
                    setPrograms(data)
                } catch (error) {
                    console.error("Error fetching programs:", error)
                }
            }
            fetchPrograms()
        }, [])

        React.useEffect(() => {
            if (editingCmo && programs.length > 0) {
                const program = programs.find(p => p.id === editingCmo.programId)
                if (editingCmo.number && editingCmo.series && program) {
                    const formattedTitle = `CHED MEMORANDUM ORDER No. ${editingCmo.number}, Series of ${editingCmo.series} - ${program.name}`
                    if (editingCmo.title !== formattedTitle) {
                        setEditingCmo({ ...editingCmo, title: formattedTitle })
                    }
                }
            }
        }, [editingCmo?.number, editingCmo?.series, editingCmo?.programId, programs])

        React.useImperativeHandle(ref, () => ({
            openEditModal: (cmo: Cmo) => {
                setEditingCmo(cmo)
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
            if (!editingCmo?.number || !editingCmo?.series || !editingCmo?.programId) {
                toast.error("Please fill in all fields")
                return
            }

            // Ensure title is set if somehow the effect didn't run
            const program = programs.find(p => p.id === editingCmo.programId)
            const finalTitle = `CHED MEMORANDUM ORDER No. ${editingCmo.number}, Series of ${editingCmo.series} - ${program?.name || ""}`

            setIsSubmitting(true)
            try {
                const response = await fetch("/api/cmo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...editingCmo, title: finalTitle }),
                })

                if (response.ok) {
                    toast.success(editingCmo.id ? "CMO updated" : "CMO created")
                    setIsModalOpen(false)
                    onRefresh()
                } else {
                    toast.error("Failed to save CMO")
                }
            } catch (error) {
                console.error("Error saving CMO:", error)
                toast.error("Error saving CMO")
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <div>
                <div className="flex items-center justify-between py-4">
                    <Input
                        placeholder="Search CMOs..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => {
                        setEditingCmo({ number: "", title: "", series: new Date().getFullYear(), programId: "" })
                        setIsModalOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add CMO
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
                            <DialogTitle>{editingCmo?.id ? "Edit CMO" : "Add New CMO"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="number">CMO Number</Label>
                                <Input
                                    id="number"
                                    value={editingCmo?.number || ""}
                                    onChange={(e) => setEditingCmo({ ...editingCmo, number: e.target.value })}
                                    placeholder="e.g. 19"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="series">Series</Label>
                                <Input
                                    id="series"
                                    type="number"
                                    value={editingCmo?.series || ""}
                                    onChange={(e) => setEditingCmo({ ...editingCmo, series: parseInt(e.target.value) })}
                                    placeholder="e.g. 2017"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="programId">Program</Label>
                                <Select
                                    value={editingCmo?.programId || ""}
                                    onValueChange={(value) => setEditingCmo({ ...editingCmo, programId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {editingCmo?.title && (
                                <div className="rounded-lg bg-muted p-3">
                                    <Label className="mb-1 block text-xs uppercase text-muted-foreground">Preview</Label>
                                    <p className="text-sm font-medium">{editingCmo.title}</p>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {editingCmo?.id ? "Update" : "Save"}
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

// Helper to open edit modal from parent/columns
export interface DataTableRef {
    openEditModal: (cmo: Cmo) => void
}
