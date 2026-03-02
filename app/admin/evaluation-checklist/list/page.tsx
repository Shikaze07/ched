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

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progRes, cmoRes] = await Promise.all([
                    fetch("/api/programs"),
                    fetch("/api/cmo") // Note: I might need to update this API to include counts or fetch them separately
                ])
                const progData = await progRes.json()
                const cmoData = await cmoRes.json()
                setPrograms(progData)

                // Fetch template status for each CMO
                const cmosWithStatus = await Promise.all(cmoData.map(async (cmo: CMO) => {
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

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Checklist Templates</h1>
                    <p className="text-muted-foreground text-lg">
                        Overview of evaluation checklist templates for all Programs and CMOs.
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href="/admin/evaluation-checklist/builder">
                        <Plus className="mr-2 h-5 w-5" /> Create New Template
                    </Link>
                </Button>
            </div>

            <Card className="bg-muted/30 border-primary/10">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="search" className="sr-only">Search CMOs</Label>
                        <Input
                            id="search"
                            placeholder="Search by CMO Number or Title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 shadow-sm"
                        />
                    </div>
                    <div className="w-full md:w-[250px]">
                        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                            <SelectTrigger className="h-11 shadow-sm">
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
                </CardContent>
            </Card>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-muted-foreground font-medium">Loading templates list...</p>
                    </div>
                ) : filteredCmos.length > 0 ? (
                    <Card className="overflow-hidden border-2 shadow-sm">
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
                                {filteredCmos.map((cmo) => {
                                    const program = programs.find(p => p.id === cmo.programId)
                                    const hasRequirements = (cmo._count?.requirements || 0) > 0

                                    return (
                                        <TableRow key={cmo.id} className="hover:bg-muted/30 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base">{cmo.number}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">{cmo.title}</span>
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
                    </Card>
                ) : (
                    <Card className="border-2 border-dashed py-20 flex flex-col items-center justify-center gap-4">
                        <LayoutList className="h-12 w-12 text-muted-foreground/30" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold">No templates found</h3>
                            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
