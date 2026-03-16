"use client"

import * as React from "react"
import { toast } from "sonner"
import { Search, BarChart3, Download, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EvaluationRecord {
    id: string
    personnelName: string
    position: string
    institution: string
    academicYear: string
    selectedCMOs: any[]
    refNo: string
    orNumber: string
    dateOfEvaluation: string
    timestamp: string
}

interface FilterState {
    personnelName: string
    institution: string
    cmo: string
}

export default function ReportsPage() {
    const [evaluations, setEvaluations] = React.useState<EvaluationRecord[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [institutions, setInstitutions] = React.useState<{ id: string; name: string }[]>([])
    const [cmos, setCmos] = React.useState<{ id: string; number: string; title: string }[]>([])
    const [filters, setFilters] = React.useState<FilterState>({
        personnelName: "",
        institution: "",
        cmo: "",
    })
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [evalRes, instRes, cmoRes] = await Promise.all([
                    fetch("/api/evaluation-records"),
                    fetch("/api/institution"),
                    fetch("/api/cmo"),
                ])

                const evalData = await evalRes.json()
                const instData = await instRes.json()
                const cmoData = await cmoRes.json()

                const instMap: Record<string, string> = Array.isArray(instData)
                    ? instData.reduce((m: Record<string, string>, i: any) => {
                          m[i.id] = i.name
                          return m
                      }, {})
                    : {}

                const mappedEvals = Array.isArray(evalData)
                    ? evalData.map((e: any) => ({
                          ...e,
                          institution: instMap[e.institution] || e.institution,
                      }))
                    : []

                setEvaluations(mappedEvals)
                setInstitutions(Array.isArray(instData) ? instData : [])
                setCmos(Array.isArray(cmoData) ? cmoData : [])
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load report data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const filteredEvaluations = evaluations.filter((evaluation) => {
        const nameMatch = evaluation.personnelName
            .toLowerCase()
            .includes(filters.personnelName.toLowerCase())
        const instMatch = evaluation.institution
            .toLowerCase()
            .includes(filters.institution.toLowerCase())

        let cmoMatch = true
        if (filters.cmo) {
            const selectedCmos = Array.isArray(evaluation.selectedCMOs) ? evaluation.selectedCMOs : []
            const cmoSearchLower = filters.cmo.toLowerCase()
            cmoMatch = selectedCmos.some((item: any) => {
                const id = typeof item === "string" ? item : item?.id || item?.value
                const cmo = cmos.find(c => c.id === id)
                if (!cmo) return false
                return cmo.number.toLowerCase().includes(cmoSearchLower) ||
                       cmo.title.toLowerCase().includes(cmoSearchLower)
            })
        }

        return nameMatch && instMatch && cmoMatch
    })

    const pageCount = Math.ceil(filteredEvaluations.length / pageSize)
    const paginatedEvaluations = filteredEvaluations.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    React.useEffect(() => {
        setCurrentPage(1)
    }, [filters, pageSize])

    const handleClearFilters = () => {
        setFilters({
            personnelName: "",
            institution: "",
            cmo: "",
        })
        setCurrentPage(1)
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== "")

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getCmoDisplay = (selectedCmos: any) => {
        if (!Array.isArray(selectedCmos)) return "N/A"
        const cmoIds = selectedCmos
            .map((item: any) =>
                typeof item === "string" ? item : item?.id || item?.value
            )
            .filter(Boolean)

        return cmos
            .filter((c) => cmoIds.includes(c.id))
            .map((c) => c.number)
            .join(", ") || "N/A"
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold tracking-tight">Evaluation Reports</h1>
                </div>
                <p className="text-muted-foreground">
                    View and filter evaluations by personnel, institution, or CMO.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{evaluations.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across all records</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredEvaluations.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasActiveFilters ? "Based on active filters" : "No filters applied"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(evaluations.map((e) => e.institution)).size}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Unique institutions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle>Filters</CardTitle>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="personnel-filter">Personnel Name</Label>
                            <Input
                                id="personnel-filter"
                                placeholder="Search by name..."
                                value={filters.personnelName}
                                onChange={(e) =>
                                    setFilters({ ...filters, personnelName: e.target.value })
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="institution-filter">Institution</Label>
                            <Input
                                id="institution-filter"
                                placeholder="Search by institution..."
                                value={filters.institution}
                                onChange={(e) =>
                                    setFilters({ ...filters, institution: e.target.value })
                                }
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cmo-filter">CMO</Label>
                            <Input
                                id="cmo-filter"
                                placeholder="Search by CMO number or title..."
                                value={filters.cmo}
                                onChange={(e) =>
                                    setFilters({ ...filters, cmo: e.target.value })
                                }
                                className="h-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading evaluation data...</p>
                </div>
            ) : filteredEvaluations.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Reference No</TableHead>
                                <TableHead className="font-bold">Personnel Name</TableHead>
                                <TableHead className="font-bold">Position</TableHead>
                                <TableHead className="font-bold">Institution</TableHead>
                                <TableHead className="font-bold">CMO(s)</TableHead>
                                <TableHead className="font-bold">Academic Year</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedEvaluations.map((evaluation) => (
                                <TableRow key={evaluation.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <Badge variant="outline">{evaluation.refNo}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{evaluation.personnelName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {evaluation.position}
                                    </TableCell>
                                    <TableCell className="text-sm">{evaluation.institution}</TableCell>
                                    <TableCell className="text-sm font-medium">
                                        <span className="text-primary">
                                            {getCmoDisplay(evaluation.selectedCMOs)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {evaluation.academicYear}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(evaluation.dateOfEvaluation)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border-2 border-dashed py-20 flex flex-col items-center justify-center gap-4 rounded-md">
                    <Search className="h-12 w-12 text-muted-foreground/30" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold">No evaluations found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredEvaluations.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4 border-t px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {filteredEvaluations.length} evaluation(s) total
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="page-size" className="text-sm whitespace-nowrap">
                                Rows per page
                            </Label>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => setPageSize(Number(value))}
                            >
                                <SelectTrigger id="page-size" className="h-8 w-[70px]">
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
                        <div className="text-sm font-medium ml-4">
                            Page {currentPage} of {pageCount}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                    pages.push(
                                        1,
                                        "...",
                                        pageCount - 4,
                                        pageCount - 3,
                                        pageCount - 2,
                                        pageCount - 1,
                                        pageCount
                                    )
                                } else {
                                    pages.push(
                                        1,
                                        "...",
                                        currentPage - 1,
                                        currentPage,
                                        currentPage + 1,
                                        "...",
                                        pageCount
                                    )
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
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                            }
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
