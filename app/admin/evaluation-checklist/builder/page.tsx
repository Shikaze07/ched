"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ArrowRight, LayoutList, FileText, CheckCircle2, ArrowUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

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
}

interface Requirement {
    id: string
    description: string
    requiredEvidence: string
    sortOrder: number
}

interface Section {
    id: string
    sectionNumber: string
    sectionTitle: string
    sortOrder: number
    requirements: Requirement[]
}

import { useSearchParams } from "next/navigation"

function ChecklistBuilderContent() {
    const searchParams = useSearchParams()
    const urlCmoId = searchParams.get("cmoId")
    const urlProgramId = searchParams.get("programId")

    const [programs, setPrograms] = React.useState<Program[]>([])
    const [cmos, setCmos] = React.useState<CMO[]>([])
    const [selectedProgram, setSelectedProgram] = React.useState(urlProgramId || "")
    const [selectedCmo, setSelectedCmo] = React.useState(urlCmoId || "")
    const [sections, setSections] = React.useState<Section[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Dialog states
    const [isSectionDialogOpen, setIsSectionDialogOpen] = React.useState(false)
    const [isReqDialogOpen, setIsReqDialogOpen] = React.useState(false)
    const [editingSection, setEditingSection] = React.useState<Partial<Section> | null>(null)
    const [editingReq, setEditingReq] = React.useState<Partial<Requirement> & { sectionId?: string } | null>(null)

    // Submission states
    const [isSubmittingSection, setIsSubmittingSection] = React.useState(false)
    const [isSubmittingReq, setIsSubmittingReq] = React.useState(false)
    const [deletingSectionId, setDeletingSectionId] = React.useState<string | null>(null)
    const [deletingReqId, setDeletingReqId] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (urlCmoId) {
            fetchChecklist(urlCmoId)
        }
    }, [urlCmoId])

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [progRes, cmoRes] = await Promise.all([
                    fetch("/api/programs"),
                    fetch("/api/cmo")
                ])
                const progData = await progRes.json()
                const cmoData = await cmoRes.json()
                setPrograms(Array.isArray(progData) ? progData : [])
                setCmos(Array.isArray(cmoData) ? cmoData : [])
            } catch (error) {
                console.error("Error fetching initial data:", error)
            }
        }
        fetchData()
    }, [])

    const filteredCmos = Array.isArray(cmos) ? cmos.filter(c => c.programId === selectedProgram) : []

    const fetchChecklist = async (cmoId: string) => {
        if (!cmoId) return
        setIsLoading(true)
        try {
            const response = await fetch(`/api/cmo/${cmoId}/checklist`)
            if (response.ok) {
                const data = await response.json()
                setSections(data)
            }
        } catch (error) {
            console.error("Error fetching checklist:", error)
            toast.error("Failed to load template requirements")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveSection = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const payload = {
            id: editingSection?.id,
            cmoId: selectedCmo,
            sectionNumber: formData.get("sectionNumber"),
            sectionTitle: formData.get("sectionTitle"),
            sortOrder: formData.get("sortOrder") || (sections.length + 1)
        }

        setIsSubmittingSection(true)
        try {
            const res = await fetch("/api/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast.success(payload.id ? "Section updated" : "Section created")
                setIsSectionDialogOpen(false)
                await fetchChecklist(selectedCmo)
            }
        } catch (error) {
            toast.error("Failed to save section")
        } finally {
            setIsSubmittingSection(false)
        }
    }

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Are you sure? This will delete all requirements in this section.")) return
        setDeletingSectionId(id)
        try {
            const res = await fetch(`/api/sections?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Section deleted")
                await fetchChecklist(selectedCmo)
            }
        } catch (error) {
            toast.error("Failed to delete section")
        } finally {
            setDeletingSectionId(null)
        }
    }

    const handleSaveRequirement = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const payload = {
            id: editingReq?.id,
            cmoId: selectedCmo,
            sectionId: editingReq?.sectionId,
            description: formData.get("description"),
            requiredEvidence: formData.get("requiredEvidence"),
            sortOrder: formData.get("sortOrder") || (sections.find(s => s.id === editingReq?.sectionId)?.requirements.length || 0) + 1
        }

        setIsSubmittingReq(true)
        try {
            const res = await fetch("/api/requirements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                toast.success(payload.id ? "Requirement updated" : "Requirement created")
                setIsReqDialogOpen(false)
                await fetchChecklist(selectedCmo)
            }
        } catch (error) {
            toast.error("Failed to save requirement")
        } finally {
            setIsSubmittingReq(false)
        }
    }

    const handleDeleteRequirement = async (id: string) => {
        if (!confirm("Are you sure?")) return
        setDeletingReqId(id)
        try {
            const res = await fetch(`/api/requirements?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Requirement deleted")
                await fetchChecklist(selectedCmo)
            }
        } catch (error) {
            toast.error("Failed to delete requirement")
        } finally {
            setDeletingReqId(null)
        }
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Checklist Template Builder</h1>
                <p className="text-muted-foreground">
                    Define the evaluation structure for specific programs and CHED Memorandum Orders.
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-4 py-4">
                <div className="flex-1 space-y-2 w-full">
                    <Label htmlFor="program" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic Program</Label>
                    <Select value={selectedProgram} onValueChange={(val) => {
                        setSelectedProgram(val)
                        setSelectedCmo("")
                        setSections([])
                    }}>
                        <SelectTrigger className="h-9 shadow-sm">
                            <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                            {programs.map(prog => (
                                <SelectItem key={prog.id} value={prog.id}>{prog.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2 w-full">
                    <Label htmlFor="cmo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Associated CMO</Label>
                    <Select
                        disabled={!selectedProgram}
                        value={selectedCmo}
                        onValueChange={(val) => {
                            setSelectedCmo(val)
                            fetchChecklist(val)
                        }}
                    >
                        <SelectTrigger className="h-9 shadow-sm">
                            <SelectValue placeholder={selectedProgram ? "Select CMO" : "Select a program first"} />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredCmos.map(cmo => (
                                <SelectItem key={cmo.id} value={cmo.id}>{cmo.number}</SelectItem>
                            ))}
                            {selectedProgram && filteredCmos.length === 0 && (
                                <div className="p-2 text-sm text-center text-muted-foreground">No CMOs linked to this program.</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9">
                        <Link href="/admin/evaluation-checklist/list">
                            <LayoutList className="mr-2 h-4 w-4" /> View All Templates
                        </Link>
                    </Button>
                </div>
            </div>

            {selectedCmo ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/20">
                                Template Mode
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-xl font-bold">{cmos.find(c => c.id === selectedCmo)?.number}</h2>
                        </div>
                        <Button size="lg" onClick={() => {
                            setEditingSection({ sortOrder: sections.length + 1 })
                            setIsSectionDialogOpen(true)
                        }}>
                            <Plus className="mr-2 h-5 w-5" /> Add New Section
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted-foreground font-medium">Loading requirements template...</p>
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="grid gap-8">
                            {sections.map((section) => (
                                <Card key={section.id} className="shadow-sm border-2 overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/50 border-b">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center rounded-lg font-bold text-lg shadow-sm">
                                                {section.sectionNumber}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{section.sectionTitle}</CardTitle>
                                                <CardDescription>Section Management</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => {
                                                setEditingSection(section)
                                                setIsSectionDialogOpen(true)
                                            }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" disabled={deletingSectionId === section.id} onClick={() => handleDeleteSection(section.id)}>
                                                {deletingSectionId === section.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                            <Separator orientation="vertical" className="h-8 mx-2" />
                                            <Button variant="default" onClick={() => {
                                                setEditingReq({ sectionId: section.id, sortOrder: section.requirements.length + 1 })
                                                setIsReqDialogOpen(true)
                                            }}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Requirement
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-muted/20">
                                                <TableRow>
                                                    <TableHead className="w-[80px] text-center font-bold">#</TableHead>
                                                    <TableHead className="font-bold">Requirement Description</TableHead>
                                                    <TableHead className="w-[30%] font-bold">Required Evidence</TableHead>
                                                    <TableHead className="w-[120px] text-right font-bold">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {section.requirements.map((req) => (
                                                    <TableRow key={req.id} className="group hover:bg-muted/5 transition-colors">
                                                        <TableCell className="text-center font-medium text-muted-foreground">
                                                            {req.sortOrder}
                                                        </TableCell>
                                                        <TableCell className="py-6">
                                                            <div
                                                                className="text-base prose prose-sm max-w-none text-foreground leading-relaxed"
                                                                dangerouslySetInnerHTML={{ __html: req.description }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-6">
                                                            <div className="flex items-start gap-2 text-sm bg-primary/5 border border-primary/10 p-3 rounded-md italic">
                                                                <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                                <div
                                                                    className="prose prose-sm max-w-none text-foreground"
                                                                    dangerouslySetInnerHTML={{ __html: req.requiredEvidence }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right align-top py-6">
                                                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" onClick={() => {
                                                                    setEditingReq({ ...req, sectionId: section.id })
                                                                    setIsReqDialogOpen(true)
                                                                }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" disabled={deletingReqId === req.id} onClick={() => handleDeleteRequirement(req.id)}>
                                                                    {deletingReqId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {section.requirements.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                                                            <CheckCircle2 className="h-8 w-8 opacity-20" />
                                                            This section has no requirements defined yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center gap-4">
                            <LayoutList className="h-12 w-12 text-muted-foreground/30" />
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-semibold">Empty Template</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    No sections or requirements have been defined for this CMO yet. Start building it now.
                                </p>
                            </div>
                            <Button size="lg" onClick={() => {
                                setEditingSection({ sortOrder: 1 })
                                setIsSectionDialogOpen(true)
                            }}>
                                <Plus className="mr-2 h-5 w-5" /> Create First Section
                            </Button>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/10 border-2 border-dashed rounded-xl gap-6">
                    <div className="h-16 w-16 bg-muted flex items-center justify-center rounded-full">
                        <ArrowUp className="h-8 w-8 text-muted-foreground animate-bounce" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Ready to design?</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Select a program and an associated CMO above to start managing the evaluation checklist template.
                        </p>
                    </div>
                </div>
            )}

            {/* Section Dialog */}
            <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSaveSection}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{editingSection?.id ? "Edit Section" : "Add New Section"}</DialogTitle>
                            <DialogDescription>
                                Set the section title and numbering (e.g., Section I, Section II).
                            </DialogDescription>
                        </DialogHeader>
                        <Separator className="my-4" />
                        <div className="grid gap-6 py-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sectionNumber" className="text-right font-medium">No. / ID</Label>
                                <Input id="sectionNumber" name="sectionNumber" defaultValue={editingSection?.sectionNumber} className="col-span-3 h-10" placeholder="e.g. I, II, 1, 2" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sectionTitle" className="text-right font-medium">Title</Label>
                                <Input id="sectionTitle" name="sectionTitle" defaultValue={editingSection?.sectionTitle} className="col-span-3 h-10" placeholder="e.g. Legal Basis, Faculty Qualifications" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sortOrder" className="text-right font-medium">Order</Label>
                                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={editingSection?.sortOrder} className="col-span-1 h-10" required />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" type="button" disabled={isSubmittingSection} onClick={() => setIsSectionDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmittingSection}>
                                {isSubmittingSection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSection?.id ? "Update Section" : "Save Section"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Requirement Dialog */}
            <Dialog open={isReqDialogOpen} onOpenChange={setIsReqDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <form onSubmit={handleSaveRequirement}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{editingReq?.id ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
                            <DialogDescription>
                                Define the specific requirement criteria and the evidence that needs to be presented.
                            </DialogDescription>
                        </DialogHeader>
                        <Separator className="my-4" />
                        <div className="grid gap-6 py-2">
                            <div className="space-y-3">
                                <Label htmlFor="description" className="font-bold text-base flex items-center justify-between">
                                    Requirement Description
                                    <span className="text-xs font-normal text-muted-foreground italic">(HTML/Rich text supported)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={editingReq?.description}
                                    className="min-h-[220px] text-base leading-relaxed"
                                    placeholder="Enter the full requirement text here..."
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="requiredEvidence" className="font-bold text-base flex items-center justify-between">
                                    Required Evidence
                                    <span className="text-xs font-normal text-muted-foreground italic">(HTML/Rich text supported)</span>
                                </Label>
                                <Textarea
                                    id="requiredEvidence"
                                    name="requiredEvidence"
                                    defaultValue={editingReq?.requiredEvidence}
                                    className="min-h-[140px] text-base leading-relaxed"
                                    placeholder="e.g. TOR, Certificates, Professional Portfolio, 201 File"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-10 w-[240px]">
                                <Label htmlFor="reqSortOrder" className="font-bold ">Sequence Order</Label>
                                <Input id="reqSortOrder" name="sortOrder" type="number" defaultValue={editingReq?.sortOrder} className="col-span-2 h-10" required />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" type="button" disabled={isSubmittingReq} onClick={() => setIsReqDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmittingReq}>
                                {isSubmittingReq && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingReq?.id ? "Update Requirement" : "Save Requirement"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function ChecklistManagementPage() {
    return (
        <React.Suspense fallback={
            <div className="flex flex-1 flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium">Loading Builder...</p>
            </div>
        }>
            <ChecklistBuilderContent />
        </React.Suspense>
    )
}