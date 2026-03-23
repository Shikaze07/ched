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
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
    position: string
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
        position: "",
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
        const positionMatch = evaluation.position
            ? evaluation.position.toLowerCase().includes(filters.position.toLowerCase())
            : filters.position === ""

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

        return nameMatch && instMatch && positionMatch && cmoMatch
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
            position: "",
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

    const handleExportPDF = async () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        })

        const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url
        })

        try {
            // Add Logo
            const logoImg = await loadImage("/chedheader.png")
            const imgWidth = 80
            const imgHeight = 20
            const pageWidth = doc.internal.pageSize.getWidth()
            doc.addImage(logoImg, "PNG", (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight)

            // Add Header Text
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text("EVALUATION SUMMARY REPORT", pageWidth / 2, 38, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48)
            doc.text(`Total Records: ${filteredEvaluations.length}`, 14, 53)

            if (hasActiveFilters) {
                const activeFilters = Object.entries(filters)
                    .filter(([_, v]) => v !== "")
                    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                    .join(" | ")
                doc.text(`Filters: ${activeFilters}`, 14, 58)
            }

            const tableData: string[][] = filteredEvaluations.map(e => [
                String(e.refNo),
                String(e.personnelName),
                String(e.position),
                String(e.institution),
                String(getCmoDisplay(e.selectedCMOs)),
                String(e.academicYear),
                String(formatDate(e.dateOfEvaluation))
            ])

            autoTable(doc, {
                startY: hasActiveFilters ? 63 : 58,
                head: [["Ref No", "Personnel", "Position", "Institution", "CMO(s)", "Year", "Date"]],
                body: tableData,
                headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [249, 250, 251] },
                margin: { top: 40 },
                styles: { fontSize: 8, cellPadding: 2 },
            })

            doc.save(`CHED-Evaluation-Report-${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success("PDF report downloaded successfully")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Failed to generate PDF report")
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { margin: 0; padding: 0; background: #fff !important; }
                    .print-container { padding: 15mm 20mm; position: relative; min-height: 100vh; background: #fff; }
                    .print-header { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 20px; text-align: center; }
                    .print-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 15px; }
                    .print-table th { border: 1px solid #aaa; padding: 6px 4px; background: #f8fafc; font-weight: bold; text-align: center; }
                    .print-table td { border: 1px solid #aaa; padding: 6px 4px; vertical-align: top; }
                    .print-watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-35deg);
                        font-size: 80pt;
                        font-weight: 900;
                        color: rgba(0,0,0,0.03);
                        pointer-events: none;
                        z-index: 0;
                        white-space: nowrap;
                    }
                    .print-footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
                }
                `
            }} />

            {/* SCREEN VIEW */}
            <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-bold tracking-tight">Evaluation Reports</h1>
                        </div>
                        <p className="text-muted-foreground">
                            View and filter evaluations by personnel, institution, or CMO.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">

                        <Button onClick={handleExportPDF} className="gap-2 shadow-sm">
                            <Download className="h-4 w-4" />
                            Export to PDF
                        </Button>
                    </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                <Label htmlFor="position-filter">Position</Label>
                                <Input
                                    id="position-filter"
                                    placeholder="Search by position (e.g. Dean)..."
                                    value={filters.position}
                                    onChange={(e) =>
                                        setFilters({ ...filters, position: e.target.value })
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

            {/* PRINT VIEW (hidden on screen, shown on print) */}
            <div className="hidden print:block">
                <div className="print-container">
                    {/* Watermark */}
                    <div className="print-watermark">Evaluation Report</div>

                    {/* Header: logo */}
                    <div className="print-header">
                        <img
                            src="/chedheader.png"
                            alt="CHED Logo"
                            style={{ height: "80px", objectFit: "contain" }}
                        />
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "14pt", fontWeight: "bold", textTransform: "uppercase" }}>Evaluation Summary Report</h2>
                        <p style={{ fontSize: "9pt", color: "#666" }}>Commission on Higher Education Regional Office XII</p>
                    </div>

                    {/* Summary Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "9pt", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        <div>
                            <span style={{ fontWeight: "bold" }}>Generated: </span>
                            {new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
                        </div>
                        <div>
                            <span style={{ fontWeight: "bold" }}>Total Records: </span>
                            {filteredEvaluations.length}
                        </div>
                    </div>

                    {/* Filters Applied (if any) */}
                    {hasActiveFilters && (
                        <div style={{ marginBottom: "15px", fontSize: "8.5pt", background: "#f9fafb", padding: "8px", borderRadius: "4px", border: "1px solid #eee" }}>
                            <span style={{ fontWeight: "bold" }}>Active Filters: </span>
                            {Object.entries(filters)
                                .filter(([_, v]) => v !== "")
                                .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                                .join(" | ")}
                        </div>
                    )}

                    <table className="print-table">
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>Ref No</th>
                                <th style={{ textAlign: "left" }}>Personnel Name</th>
                                <th style={{ textAlign: "left" }}>Position</th>
                                <th style={{ textAlign: "left" }}>Institution</th>
                                <th style={{ textAlign: "left" }}>CMO(s)</th>
                                <th style={{ width: "80px" }}>Year</th>
                                <th style={{ width: "100px" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvaluations.map((evaluation) => (
                                <tr key={evaluation.id}>
                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{evaluation.refNo}</td>
                                    <td>{evaluation.personnelName}</td>
                                    <td>{evaluation.position}</td>
                                    <td>{evaluation.institution}</td>
                                    <td>{getCmoDisplay(evaluation.selectedCMOs)}</td>
                                    <td style={{ textAlign: "center" }}>{evaluation.academicYear}</td>
                                    <td style={{ textAlign: "center" }}>{formatDate(evaluation.dateOfEvaluation)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="print-footer">
                        <p style={{ fontSize: "8pt", color: "#666", textAlign: "center" }}>
                            © {new Date().getFullYear()} Commission on Higher Education (CHED) Regional Office XII. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
