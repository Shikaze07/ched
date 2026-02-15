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
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import {
  mockCMOs,
  programOptions,
  getAssociatedPrograms,
  getProgramOptionsByIds
} from "@/lib/mockData";
import { Info } from "lucide-react";

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

  // Auto-populate programs when CMOs are selected
  useEffect(() => {
    if (selectedCMOs.length > 0) {
      const cmoIds = selectedCMOs.map((cmo) => cmo.value);
      const associatedProgramIds = getAssociatedPrograms(cmoIds);
      const associatedProgramOptions = getProgramOptionsByIds(associatedProgramIds);

      // Set suggested programs
      setSuggestedPrograms(associatedProgramOptions);

      // Auto-select if only one program is associated
      if (associatedProgramOptions.length === 1) {
        setSelectedPrograms(associatedProgramOptions);
      } else if (associatedProgramOptions.length > 0) {
        // If multiple programs, suggest them but let user choose
        // You can also auto-select all: setSelectedPrograms(associatedProgramOptions);
      }
    } else {
      setSuggestedPrograms([]);
      // Optionally clear selected programs when no CMO is selected
      // setSelectedPrograms([]);
    }
  }, [selectedCMOs]);

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

    // Store form data in sessionStorage
    sessionStorage.setItem(
      "evaluationData",
      JSON.stringify({
        ...formData,
        selectedCMOs: selectedCMOs.map((cmo) => cmo.value),
        selectedPrograms: selectedPrograms,
        refNo,
      })
    );

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
            <div className="flex flex-row gap-2">
              <Input
                className="w-xl"
                placeholder="Search name or control number to retrieve data..."
              />
              <Button style={{ backgroundColor: "#2980b9" }}>Search</Button>
              <Button style={{ backgroundColor: "#ffc518" }}>Print</Button>
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