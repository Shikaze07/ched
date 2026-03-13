"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Pencil, FileText, CheckCircle2, AlertCircle, LayoutList, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

                const safeCmoData = Array.isArray(cmoData) ? cmoData : []

                // Fetch template status for each CMO
                const cmosWithStatus = await Promise.all(safeCmoData.map(async (cmo: CMO) => {
                    const res = await fetch(`/api/cmo/${cmo.id}/checklist`)
                    const sections = await res.json()
                    const reqCount = sections.reduce((acc: number, s: any) => acc + (s.requirements?.length || 0), 0)
                    return {
                        ...cmo,
                        _count: {
                            sections: sections.length,
                            requirements: reqCount
                        }
                    }
                }))

                setCmos(cmosWithStatus)
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
                    <Button asChild size="sm">
                        <Link href="/admin/evaluation-checklist/builder">
                            <Plus className="mr-2 h-4 w-4" /> Create Template
                        </Link>
                    </Button>
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
                                            <Button asChild variant="outline" size="sm" >
                                                <Link href={`/admin/evaluation-checklist/builder?cmoId=${cmo.id}&programId=${cmo.programId}`}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Template
                                                </Link>
                                            </Button>
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
        </div>
    )
}
