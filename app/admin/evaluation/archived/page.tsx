"use client"

import * as React from "react"
import { toast } from "sonner"
import { Archive, ArchiveX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ArchivedEvaluation {
    id: string
    originalId: string
    personnelName: string
    position: string
    email: string
    institution: string
    academicYear: string
    selectedCMOs: any
    selectedPrograms: any
    refNo: string
    orNumber: string
    dateOfEvaluation: string
    timestamp: string
    archivedAt: string
    archivedReason: string
    archivedCmoNumber: string
    archivedCmoTitle: string
    responses: any
}

export default function ArchivedEvaluationsPage() {
    const [archived, setArchived] = React.useState<ArchivedEvaluation[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedDetails, setSelectedDetails] = React.useState<ArchivedEvaluation | null>(null)
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)

    React.useEffect(() => {
        const fetchArchived = async () => {
            try {
                const res = await fetch("/api/evaluations/archived")
                if (!res.ok) throw new Error("Failed to fetch archived evaluations")
                const data = await res.json()
                setArchived(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Error fetching archived evaluations:", error)
                toast.error("Failed to load archived evaluations")
            } finally {
                setIsLoading(false)
            }
        }
        fetchArchived()
    }, [])

    const filteredArchived = archived.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.refNo.toLowerCase().includes(query) ||
            item.personnelName.toLowerCase().includes(query) ||
            item.archivedCmoNumber.toLowerCase().includes(query) ||
            item.archivedCmoTitle.toLowerCase().includes(query)
        )
    })

    const pageCount = Math.ceil(filteredArchived.length / pageSize)
    const paginatedArchived = filteredArchived.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, pageSize])

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Archive className="h-6 w-6 text-amber-600" />
                    <h1 className="text-2xl font-bold tracking-tight">Archived Evaluations</h1>
                </div>
                <p className="text-muted-foreground">
                    Evaluations that were preserved when their templates were deleted.
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Search by Ref No, Personnel, or CMO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 shadow-sm"
                    />
                </div>
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
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading archived evaluations...</p>
                </div>
            ) : filteredArchived.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Reference No</TableHead>
                                <TableHead className="font-bold">Personnel</TableHead>
                                <TableHead className="font-bold">Template (CMO)</TableHead>
                                <TableHead className="font-bold">Archived Date</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedArchived.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <span className="text-amber-700 font-semibold">{item.refNo}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{item.personnelName}</span>
                                            <span className="text-xs text-muted-foreground">{item.position}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="secondary" className="w-fit">
                                                {item.archivedCmoNumber}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                {item.archivedCmoTitle}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(item.archivedAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedDetails(item)}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border-2 border-dashed py-20 flex flex-col items-center justify-center gap-4 rounded-md">
                    <ArchiveX className="h-12 w-12 text-muted-foreground/30" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold">No archived evaluations</h3>
                        <p className="text-muted-foreground">Evaluations will appear here when templates are deleted.</p>
                    </div>
                </div>
            )}

            {!isLoading && filteredArchived.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4 border-t px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {filteredArchived.length} archived evaluation(s) total
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

            {/* Details Dialog */}
            <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedDetails(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Archived Evaluation Details</DialogTitle>
                        <DialogDescription>
                            Reference: <span className="font-semibold text-foreground">{selectedDetails?.refNo}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDetails && (
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="template">Template Info</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Personnel Name</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.personnelName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Position</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.position}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Email</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Institution</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.institution}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Academic Year</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.academicYear}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">OR Number</label>
                                        <p className="text-sm text-muted-foreground">{selectedDetails.orNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Date of Evaluation</label>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedDetails.dateOfEvaluation).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-foreground">Archived Date</label>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedDetails.archivedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="template" className="space-y-4 mt-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-3">
                                    <div>
                                        <label className="text-sm font-semibold text-amber-900">Template CMO Number</label>
                                        <p className="text-sm text-amber-800 font-medium">{selectedDetails.archivedCmoNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-amber-900">Template CMO Title</label>
                                        <p className="text-sm text-amber-800">{selectedDetails.archivedCmoTitle}</p>
                                    </div>
                                    <div className="pt-2 border-t border-amber-200">
                                        <label className="text-sm font-semibold text-amber-900">Archive Reason</label>
                                        <p className="text-sm text-amber-800">{selectedDetails.archivedReason}</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDetails(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
