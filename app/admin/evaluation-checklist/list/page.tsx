"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Pencil, FileText, CheckCircle2, AlertCircle, LayoutList, ChevronRight, Loader2, Trash2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface Program {
    id: string
    code: string
    name: string
}

interface CMO {
    id: string
    number: string
    title: string
    programId: string | null
    _count?: {
        sections: number
        requirements: number
    }
}

export default function TemplateListPage() {
    const [programs, setPrograms] = React.useState<Program[]>([])
    const [cmos, setCmos] = React.useState<CMO[]>([])
    const [selectedProgram, setSelectedProgram] = React.useState<string>("all")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(true)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [createModalProgram, setCreateModalProgram] = React.useState("")
    const [createModalCmo, setCreateModalCmo] = React.useState("")
    const [isCreating, setIsCreating] = React.useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
    const [cmoToDelete, setCmoToDelete] = React.useState<CMO | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progRes, cmoRes] = await Promise.all([
                    fetch("/api/programs"),
                    fetch("/api/cmo") // Note: I might need to update this API to include counts or fetch them separately
                ])
                const progData = await progRes.json()
                const cmoData = await cmoRes.json()
                setPrograms(Array.isArray(progData) ? progData : [])
                setCmos(Array.isArray(cmoData) ? cmoData : [])
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load templates list")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredCmos = cmos.filter(cmo => {
        const matchesProgram = selectedProgram === "all" || cmo.programId === selectedProgram
        const matchesSearch = cmo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cmo.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesProgram && matchesSearch
    })

    const pageCount = Math.ceil(filteredCmos.length / pageSize)
    const paginatedCmos = filteredCmos.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [selectedProgram, searchQuery, pageSize])

    const filteredCreateModalCmos = createModalProgram 
        ? cmos.filter(c => c.programId === createModalProgram)
        : []

    const handleCreateTemplate = async () => {
        if (!createModalProgram || !createModalCmo) {
            toast.error("Please select both program and CMO")
            return
        }
        setIsCreating(true)
        try {
            router.push(`/admin/evaluation-checklist/builder?cmoId=${createModalCmo}&programId=${createModalProgram}`)
            setIsCreateModalOpen(false)
            setCreateModalProgram("")
            setCreateModalCmo("")
        } catch (error) {
            toast.error("Failed to navigate to builder")
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteTemplate = async () => {
        if (!cmoToDelete) return
        
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/cmo?id=${cmoToDelete.id}`, {
                method: "DELETE",
            })
            
            if (!response.ok) {
                throw new Error("Failed to delete template")
            }

            const data = await response.json()
            
            toast.success(data.message || "Template deleted successfully. Related evaluations are archived.")
            
            // Refresh the CMO list
            const cmoRes = await fetch("/api/cmo")
            const cmoData = await cmoRes.json()
            setCmos(Array.isArray(cmoData) ? cmoData : [])
            
            setDeleteConfirmOpen(false)
            setCmoToDelete(null)
        } catch (error) {
            console.error("Error deleting template:", error)
            toast.error("Failed to delete template")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Checklist Templates</h1>
                <p className="text-muted-foreground">
                    Overview of evaluation checklist templates for all Programs and CMOs.
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                <div className="flex flex-1 items-center gap-4 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Input
                            placeholder="Search by CMO Number or Title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 shadow-sm"
                        />
                    </div>
                    <div className="w-[200px]">
                        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                            <SelectTrigger className="h-9 shadow-sm">
                                <SelectValue placeholder="All Programs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Programs</SelectItem>
                                {programs.map(prog => (
                                    <SelectItem key={prog.id} value={prog.id}>{prog.code}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button> */}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading templates list...</p>
                </div>
            ) : filteredCmos.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">CMO Number</TableHead>
                                <TableHead className="font-bold">Program</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold text-center">Sections</TableHead>
                                <TableHead className="font-bold text-center">Requirements</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCmos.map((cmo) => {
                                const program = programs.find(p => p.id === cmo.programId)
                                const hasRequirements = (cmo._count?.requirements || 0) > 0

                                return (
                                    <TableRow key={cmo.id} className="hover:bg-muted/30 transition-colors group">
                                        <TableCell className="font-medium max-w-[400px]">
                                            <div className="flex flex-col">
                                                <span className="text-base">{cmo.number}</span>
                                                <span className="text-xs text-muted-foreground break-words whitespace-normal leading-normal">{cmo.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                {program?.code || "N/A"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {hasRequirements ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Ready
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-600 font-medium text-sm">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Incomplete
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-muted-foreground">
                                            {cmo._count?.sections || 0}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-muted-foreground">
                                            {cmo._count?.requirements || 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/evaluation-checklist/builder?cmoId=${cmo.id}&programId=${cmo.programId}`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Template
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setCmoToDelete(cmo)
                                                            setDeleteConfirmOpen(true)
                                                        }}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Template
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border-2 border-dashed py-20 flex flex-col items-center justify-center gap-4 rounded-md">
                    <LayoutList className="h-12 w-12 text-muted-foreground/30" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold">No templates found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                    </div>
                </div>
            )}

            {!isLoading && filteredCmos.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4 border-t px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {filteredCmos.length} template(s) total
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium mr-4">
                            Page {currentPage} of {pageCount}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {(() => {
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
                                    onClick={() => typeof page === "number" && setCurrentPage(page)}
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
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                            disabled={currentPage === pageCount}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Template Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[600px] gap-0">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-3xl font-bold">Create New Template</DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Select a program and CHED Memorandum Order to start building your evaluation checklist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8 py-6 px-2">
                        <div className="space-y-3">
                            <Label htmlFor="create-program" className="text-base font-semibold text-foreground">
                                Step 1: Academic Program
                            </Label>
                            <Select value={createModalProgram} onValueChange={(val) => {
                                setCreateModalProgram(val)
                                setCreateModalCmo("")
                            }}>
                                <SelectTrigger id="create-program" className="h-11 text-base border-primary/20 focus:border-primary">
                                    <SelectValue placeholder="Choose an academic program..." />
                                </SelectTrigger>
                                <SelectContent className="max-w-[500px]">
                                    {programs.map(prog => (
                                        <SelectItem key={prog.id} value={prog.id} className="text-base py-2">
                                            <span className="font-medium">{prog.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createModalProgram && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-sm text-foreground font-medium">
                                        {programs.find(p => p.id === createModalProgram)?.name}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="create-cmo" className="text-base font-semibold text-foreground">
                                Step 2: CMO (CHED Memorandum Order)
                            </Label>
                            <Select 
                                disabled={!createModalProgram}
                                value={createModalCmo} 
                                onValueChange={setCreateModalCmo}
                            >
                                <SelectTrigger id="create-cmo" className="h-11 text-base border-primary/20 focus:border-primary disabled:opacity-50">
                                    <SelectValue placeholder={createModalProgram ? "Choose a CMO..." : "Select a program first"} />
                                </SelectTrigger>
                                <SelectContent className="max-w-[500px] max-h-[300px]">
                                    {filteredCreateModalCmos.map(cmo => (
                                        <SelectItem key={cmo.id} value={cmo.id} className="py-3 px-2 space-y-1">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-semibold text-base">{cmo.number}</span>
                                                <span className="text-sm text-muted-foreground break-words max-w-sm line-clamp-2">{cmo.title}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {createModalProgram && filteredCreateModalCmos.length === 0 && (
                                        <div className="p-4 text-sm text-center text-muted-foreground">
                                            <AlertCircle className="h-5 w-5 inline mr-2 opacity-50" />
                                            No CMOs available for this program
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            {createModalCmo && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-2">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-semibold text-foreground block">
                                                {filteredCreateModalCmos.find(c => c.id === createModalCmo)?.number}
                                            </span>
                                            <span className="text-sm text-muted-foreground break-words line-clamp-2">
                                                {filteredCreateModalCmos.find(c => c.id === createModalCmo)?.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="border-t pt-4 gap-3">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating} className="font-medium">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateTemplate} 
                            disabled={!createModalProgram || !createModalCmo || isCreating}
                            className="font-medium"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Template
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                            This template will be deleted, but any evaluations that reference it will be automatically archived and preserved.
                        </DialogDescription>
                    </DialogHeader>
                    {cmoToDelete && (
                        <div className="bg-muted p-4 rounded-md space-y-2">
                            <div>
                                <span className="font-semibold">{cmoToDelete.number}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{cmoToDelete.title}</p>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> Any evaluation records using this template will be safely archived and can still be accessed from the Archived Evaluations section.
                        </p>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteTemplate}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Template
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
