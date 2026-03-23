"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { Info, Search, X, AlertTriangle } from "lucide-react";
import { evaluationStore, EvaluationRecord } from "@/lib/evaluation-store";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface AssessmentFormProps {
    cmoOptions: Option[];
    programOptions: Option[];
    institutionOptions: Option[];
    /** Maps cmoId → programId for auto-populate */
    cmoProgramMap: Record<string, string | null>;
}

export function AssessmentForm({
    cmoOptions,
    programOptions,
    institutionOptions,
    cmoProgramMap,
}: AssessmentFormProps) {
    const router = useRouter();
    const [selectedCMOs, setSelectedCMOs] = useState<Option[]>([]);
    const [selectedPrograms, setSelectedPrograms] = useState<Option[]>([]);
    const [suggestedPrograms, setSuggestedPrograms] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        personnelName: "",
        position: "",
        email: "",
        institution: "",
        academicYear: "",
        orNumber: "",
        dateOfEvaluation: "",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<EvaluationRecord[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Duplicate warning states
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [duplicateCMOList, setDuplicateCMOList] = useState<string[]>([]);
    const [pendingRecord, setPendingRecord] = useState<EvaluationRecord | null>(null);

    // Validation states
    const [showValidationDialog, setShowValidationDialog] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [validationTitle, setValidationTitle] = useState("Required Information");

    // Auto-populate programs when CMOs are selected (using DB programId link)
    useEffect(() => {
        if (selectedCMOs.length > 0 && programOptions.length > 0) {
            const linked: Option[] = [];
            selectedCMOs.forEach((selCmo) => {
                const programId = cmoProgramMap[selCmo.value];
                if (programId) {
                    const prog = programOptions.find((p) => p.value === programId);
                    if (prog) linked.push(prog);
                }
            });

            setSuggestedPrograms(linked);
            if (linked.length > 0) {
                setSelectedPrograms([linked[0]]);
            }
        } else {
            setSuggestedPrograms([]);
        }
    }, [selectedCMOs, cmoProgramMap, programOptions]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error("Please enter a search query");
            return;
        }

        setIsSearching(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(
                `/api/evaluation/search?q=${encodeURIComponent(searchQuery)}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            let results: EvaluationRecord[] = [];

            if (response.ok) {
                results = await response.json();
            }

            if (results.length === 0) {
                results = evaluationStore.searchRecords(searchQuery);
            }

            setSearchResults(results);
            setShowResults(true);

            if (results.length === 0) {
                toast.error("No records found for that search query.");
            } else {
                toast.success(`Found ${results.length} record(s)`);
            }
        } catch (error: any) {
            console.error("Search error:", error);
            if (error.name === "AbortError") {
                toast.error("Search timed out. Please try again.");
            } else {
                const results = evaluationStore.searchRecords(searchQuery);
                setSearchResults(results);
                setShowResults(true);
                if (results.length === 0) {
                    toast.error("No records found for that search query.");
                }
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (record: EvaluationRecord) => {
        sessionStorage.setItem("evaluationData", JSON.stringify(record));
        router.push(`/evaluation/${record.refNo}`);
    };

    const handleProceed = () => {
        if (!formData.personnelName || !formData.position || !formData.email) {
            setValidationTitle("Incomplete Form");
            setValidationMessage("Please fill in all required encoder details (*)");
            setShowValidationDialog(true);
            return;
        }

        if (!formData.institution || !formData.academicYear) {
            setValidationTitle("Incomplete Form");
            setValidationMessage("Please fill in all required institution information (*)");
            setShowValidationDialog(true);
            return;
        }

        if (selectedCMOs.length === 0) {
            setValidationTitle("CMO Required");
            setValidationMessage("Please select a CMO to proceed with the evaluation.");
            setShowValidationDialog(true);
            return;
        }

        if (selectedPrograms.length === 0) {
            setValidationTitle("Program Required");
            setValidationMessage("Please select a program associated with the CMO.");
            setShowValidationDialog(true);
            return;
        }

        const isValidEmail = (email: string) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail(formData.email)) {
            setValidationTitle("Invalid Email");
            setValidationMessage(
                "The email address provided is invalid. Please enter a valid email (e.g., name@example.com)."
            );
            setShowValidationDialog(true);
            return;
        }

        const records = evaluationStore.getAllRecords();
        const currentEmail = formData.email.toLowerCase().trim();
        const currentInstitution = formData.institution.trim();
        const currentAcademicYear = formData.academicYear.trim();

        const existingForUser = records.filter(
            (r) =>
                r.email.toLowerCase().trim() === currentEmail &&
                r.institution.trim() === currentInstitution &&
                r.academicYear.trim() === currentAcademicYear
        );

        const duplicates: string[] = [];
        selectedCMOs.forEach((cmo) => {
            const alreadyEvaluated = existingForUser.some((r) =>
                r.selectedCMOs.includes(cmo.value)
            );
            if (alreadyEvaluated) {
                duplicates.push(cmo.label);
            }
        });

        const refNo = generateRefNo();

        const record: EvaluationRecord = {
            ...formData,
            selectedCMOs: selectedCMOs.map((cmo) => cmo.value),
            selectedPrograms: selectedPrograms,
            refNo,
            timestamp: Date.now(),
        };

        if (duplicates.length > 0) {
            setDuplicateCMOList(duplicates);
            setPendingRecord(record);
            setShowDuplicateWarning(true);
            return;
        }

        saveAndNavigate(record);
    };

    const saveAndNavigate = async (record: EvaluationRecord) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/evaluation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personnelName: record.personnelName,
                    position: record.position,
                    email: record.email,
                    institution: record.institution,
                    academicYear: record.academicYear,
                    selectedCMOs: record.selectedCMOs,
                    selectedPrograms: record.selectedPrograms,
                    refNo: record.refNo,
                    orNumber: record.orNumber,
                    dateOfEvaluation: record.dateOfEvaluation,
                }),
            });

            if (!response.ok) throw new Error("Failed to save evaluation record");

            evaluationStore.saveRecord(record);
            sessionStorage.setItem("evaluationData", JSON.stringify(record));
            toast.success("Evaluation record saved! Proceeding to checklist...");
            router.push(`/evaluation/${record.refNo}`);
        } catch (error) {
            console.error("Error saving evaluation record:", error);
            toast.error("Failed to save evaluation record. Please try again.");
            setIsLoading(false);
        }
    };

    const generateRefNo = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleApplySuggestedPrograms = () => {
        setSelectedPrograms(suggestedPrograms);
    };

    const handleSearchCMO = async (value: string) =>
        cmoOptions.filter((option) =>
            option.label.toLowerCase().includes(value.toLowerCase())
        );

    const handleSearchProgram = async (value: string) =>
        programOptions.filter((option) =>
            option.label.toLowerCase().includes(value.toLowerCase())
        );

    return (
        <div className="p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-xl md:text-2xl">
                            Program Evaluation Self Assessment
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2 relative w-full md:w-auto md:max-w-2xl">
                            <div className="relative flex-1">
                                <Input
                                    className="w-full sm:min-w-[300px] md:min-w-[400px]"
                                    placeholder="Search name or control number to retrieve data..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                {searchQuery && (
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setShowResults(false);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 sm:flex-none"
                                    style={{ backgroundColor: "#2980b9" }}
                                    onClick={handleSearch}
                                    disabled={!searchQuery.trim() || isSearching}
                                >
                                    {isSearching ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⟳</span>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            Search
                                        </>
                                    )}
                                </Button>

                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                                    {searchResults.length > 0 ? (
                                        <div className="p-2">
                                            <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b">
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Search Results ({searchResults.length})
                                                </p>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowResults(false);
                                                    }}
                                                    aria-label="Close search results"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {searchResults.map((result) => (
                                                <div
                                                    key={result.refNo}
                                                    className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded border-b last:border-0 transition-colors"
                                                    onClick={() => handleSelectResult(result)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            handleSelectResult(result);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {result.personnelName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {result.institution} - {result.academicYear}
                                                        </p>
                                                        {/* CMO Details */}
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {result.selectedCMOs.map((cmoId) => {
                                                                const cmoOpt = cmoOptions.find((c) => c.value === cmoId);
                                                                return cmoOpt ? (
                                                                    <Badge
                                                                        key={cmoId}
                                                                        variant="outline"
                                                                        className="text-[9px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                                                                    >
                                                                        {cmoOpt.label.split(" - ")[0]}
                                                                    </Badge>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {result.refNo}
                                                        </Badge>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {new Date(result.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertTriangle className="w-8 h-8 text-gray-300" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">No Records Found</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        No evaluation records match &quot;{searchQuery}&quot;
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        You can proceed to create a new evaluation below
                                                    </p>
                                                </div>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 transition-colors mt-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowResults(false);
                                                        setSearchQuery("");
                                                    }}
                                                    aria-label="Close search results"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Please provide the institution details and complete the evaluation
                        form below.
                    </p>

                    <p className="text-sm text-muted-foreground">
                        <span className="text-red-500">(*)</span> Required Field
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Encoder Details */}
                    <div className="space-y-4 border p-4 rounded-lg">
                        <h2 className="font-semibold text-lg text-blue-600">
                            Encoder Details
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Personnel Name <span className="text-red-500">(*)</span>
                                </Label>
                                <Input
                                    placeholder=""
                                    value={formData.personnelName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, personnelName: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Position (Program Head / Dean){" "}
                                    <span className="text-red-500">(*)</span>
                                </Label>
                                <Input
                                    placeholder=""
                                    value={formData.position}
                                    onChange={(e) =>
                                        setFormData({ ...formData, position: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Email <span className="text-red-500">(*)</span>
                                </Label>
                                <Input
                                    placeholder=""
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Institution Information */}
                    <div className="space-y-4 border p-4 rounded-lg">
                        <h2 className="font-semibold text-lg text-blue-600">
                            Institution Information
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Name of Institution <span className="text-red-500">(*)</span>
                                </Label>
                                <div className="w-full">
                                    <Select
                                        value={formData.institution}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, institution: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your institution from options" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutionOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Academic Year <span className="text-red-500">(*)</span>
                                </Label>
                                <div className="w-full">
                                    <Select
                                        value={formData.academicYear}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, academicYear: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                                            <SelectItem value="2025-2026">2025-2026</SelectItem>
                                            <SelectItem value="2026-2027">2026-2027</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    CMO <span className="text-red-500">(*)</span>
                                </Label>
                                <MultipleSelector
                                    value={selectedCMOs}
                                    onChange={setSelectedCMOs}
                                    options={cmoOptions}
                                    placeholder="Select a CMO..."
                                    maxSelected={1}
                                    hidePlaceholderWhenSelected={true}
                                    hideClearAllButton={true}
                                    onSearch={handleSearchCMO}
                                    triggerSearchOnFocus={true}
                                    emptyIndicator={
                                        <p className="text-center text-sm text-muted-foreground py-6">
                                            No CMOs found.
                                        </p>
                                    }
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">
                                    Program <span className="text-red-500">(*)</span>
                                </Label>
                                <MultipleSelector
                                    value={selectedPrograms}
                                    onChange={setSelectedPrograms}
                                    options={programOptions}
                                    placeholder="Select a program..."
                                    maxSelected={1}
                                    hidePlaceholderWhenSelected={true}
                                    hideClearAllButton={true}
                                    creatable
                                    onSearch={handleSearchProgram}
                                    triggerSearchOnFocus={true}
                                    emptyIndicator={
                                        <p className="text-center text-sm text-muted-foreground py-6">
                                            No programs found. Press Enter to add custom program.
                                        </p>
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">OR Number</Label>
                                <Input
                                    placeholder="Enter OR number"
                                    value={formData.orNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, orNumber: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label className="mb-2">Date of Evaluation</Label>
                                <Input
                                    type="date"
                                    value={formData.dateOfEvaluation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dateOfEvaluation: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <Button
                            className="text-white"
                            style={{ backgroundColor: "#2980b9" }}
                            onClick={handleProceed}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Proceed to Evaluation"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Duplicate Warning Dialog */}
            <Dialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            Duplicate Evaluation Detected
                        </DialogTitle>
                        <DialogDescription className="py-2">
                            Our records show that you have already evaluated the following CMO(s) for this institution and academic year:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100 mb-4">
                        <ul className="list-disc pl-5 space-y-1">
                            {duplicateCMOList.map((cmo, index) => (
                                <li key={index} className="text-sm font-medium text-amber-900">
                                    {cmo}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Do you want to proceed with a new evaluation anyway, or cancel?
                    </p>
                    <DialogFooter className="flex sm:justify-between gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDuplicateWarning(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            style={{ backgroundColor: "#2980b9" }}
                            onClick={() => {
                                if (pendingRecord) {
                                    saveAndNavigate(pendingRecord);
                                }
                                setShowDuplicateWarning(false);
                            }}
                        >
                            Proceed Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generic Validation Dialog */}
            <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Info className="h-5 w-5" />
                            {validationTitle}
                        </DialogTitle>
                        <DialogDescription className="py-2 text-gray-700 font-medium">
                            {validationMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="w-full sm:w-auto"
                            style={{ backgroundColor: "#2980b9" }}
                            onClick={() => setShowValidationDialog(false)}
                        >
                            OK, I&apos;ll fix it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
