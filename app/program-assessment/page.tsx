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
import {
  mockCMOs,
  programOptions,
  getAssociatedPrograms,
  getProgramOptionsByIds
} from "@/lib/mockData";
import { Info, Search, X } from "lucide-react";
import { evaluationStore, EvaluationRecord } from "@/lib/evaluation-store";

// Transform CMO data to options
const cmoOptions: Option[] = mockCMOs.map((cmo) => ({
  value: cmo.id,
  label: `${cmo.cmo_number} - ${cmo.title}`,
}));

const Page = () => {
  const router = useRouter();
  const [selectedCMOs, setSelectedCMOs] = useState<Option[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<Option[]>([]);
  const [suggestedPrograms, setSuggestedPrograms] = useState<Option[]>([]);
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

  // Auto-populate programs when CMOs are selected
  useEffect(() => {
    if (selectedCMOs.length > 0) {
      const cmoIds = selectedCMOs.map((cmo) => cmo.value);
      const associatedProgramIds = getAssociatedPrograms(cmoIds);
      const associatedProgramOptions = getProgramOptionsByIds(associatedProgramIds);

      // Set suggested programs
      setSuggestedPrograms(associatedProgramOptions);

      // Auto-select all associated programs
      if (associatedProgramOptions.length > 0) {
        setSelectedPrograms(associatedProgramOptions);
      }
    } else {
      setSuggestedPrograms([]);
      // Optionally clear selected programs when no CMO is selected
      // setSelectedPrograms([]);
    }
  }, [selectedCMOs]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const results = evaluationStore.searchRecords(searchQuery);
    setSearchResults(results);
    setShowResults(true);
  };

  const handleSelectResult = (record: EvaluationRecord) => {
    // Store record in sessionStorage for the evaluation page to pick up
    sessionStorage.setItem("evaluationData", JSON.stringify(record));

    // Navigate directly to the evaluation page
    router.push(`/evaluation/${record.refNo}`);
  };

  const handleProceed = () => {
    // Validation
    if (!formData.personnelName || !formData.position || !formData.email) {
      alert("Please fill in all required encoder details");
      return;
    }

    if (!formData.institution || !formData.academicYear) {
      alert("Please fill in all required institution information");
      return;
    }

    if (selectedCMOs.length === 0) {
      alert("Please select at least one CMO");
      return;
    }

    if (selectedPrograms.length === 0) {
      alert("Please select at least one program");
      return;
    }

    // Generate reference number
    const refNo = generateRefNo();

    const record: EvaluationRecord = {
      ...formData,
      selectedCMOs: selectedCMOs.map((cmo) => cmo.value),
      selectedPrograms: selectedPrograms,
      refNo,
      timestamp: Date.now(),
    };

    // Save to store
    evaluationStore.saveRecord(record);

    // Store form data in sessionStorage for current evaluation session
    sessionStorage.setItem("evaluationData", JSON.stringify(record));

    // Navigate to evaluation page
    router.push(`/evaluation/${refNo}`);
  };

  const generateRefNo = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleApplySuggestedPrograms = () => {
    setSelectedPrograms(suggestedPrograms);
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center">
            <CardTitle className="flex-1">
              Program Evaluation Self Assessment
            </CardTitle>
            <div className="flex flex-row gap-2 relative">
              <div className="relative flex-1">
                <Input
                  className="w-xl"
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
              <Button
                style={{ backgroundColor: "#2980b9" }}
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button style={{ backgroundColor: "#ffc518" }}>Print</Button>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-500 mb-2 px-2">
                        Search Results ({searchResults.length})
                      </p>
                      {searchResults.map((result) => (
                        <div
                          key={result.refNo}
                          className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded border-b last:border-0"
                          onClick={() => handleSelectResult(result)}
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
                                const cmo = mockCMOs.find((c) => c.id === cmoId);
                                return cmo ? (
                                  <Badge
                                    key={cmoId}
                                    variant="outline"
                                    className="text-[9px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {cmo.cmo_number.split(',')[0]}
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
                    <div className="p-4 text-center text-sm text-gray-500">
                      No records found for "{searchQuery}"
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
                      <SelectItem value="university-of-manila">
                        University of Manila
                      </SelectItem>
                      <SelectItem value="technological-institute">
                        Technological Institute of the Philippines
                      </SelectItem>
                      <SelectItem value="state-university">
                        Philippine State University
                      </SelectItem>
                      <SelectItem value="sti-college-koronadal">
                        STI COLLEGE KORONADAL
                      </SelectItem>
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
                  defaultOptions={cmoOptions}
                  placeholder="Select one or multiple CMOs..."
                  emptyIndicator={
                    <p className="text-center text-sm text-muted-foreground py-6">
                      No CMOs found.
                    </p>
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Selected {selectedCMOs.length} CMO(s)
                </p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2">
                  Program <span className="text-red-500">(*)</span>
                </Label>
                <MultipleSelector
                  value={selectedPrograms}
                  onChange={setSelectedPrograms}
                  defaultOptions={programOptions}
                  placeholder="Select programs..."
                  creatable
                  emptyIndicator={
                    <p className="text-center text-sm text-muted-foreground py-6">
                      No programs found. Press Enter to add custom program.
                    </p>
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Selected {selectedPrograms.length} program(s)
                </p>

                {/* Show suggested programs */}
                {/* {suggestedPrograms.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-800 mb-1">
                          Suggested Programs for Selected CMO(s):
                        </p>
                        <ul className="text-xs text-blue-700 space-y-0.5">
                          {suggestedPrograms.map((program) => (
                            <li key={program.value}>• {program.label}</li>
                          ))}
                        </ul>
                        {selectedPrograms.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={handleApplySuggestedPrograms}
                          >
                            Apply Suggested Programs
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )} */}
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
            >
              Proceed to Evaluation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;