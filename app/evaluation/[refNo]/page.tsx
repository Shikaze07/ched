"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { organizeEvaluationData, type EvaluationResponse } from "@/lib/mockData";
import { Copy, Plus, ArrowLeft } from "lucide-react";

interface EvaluationData {
  personnelName: string;
  position: string;
  email: string;
  institution: string;
  academicYear: string;
  selectedCMOs: string[];
  program: string;
  orNumber: string;
  dateOfEvaluation: string;
  refNo: string;
}

const EvaluationPage = () => {
  const params = useParams();
  const router = useRouter();
  const refNo = params.refNo as string;

  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [organizedData, setOrganizedData] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, EvaluationResponse>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{
    requirementId: string;
    field: "actual_situation" | "google_link";
    value: string;
  } | null>(null);

  useEffect(() => {
    // Load evaluation data from sessionStorage
    const stored = sessionStorage.getItem("evaluationData");
    if (stored) {
      const data: EvaluationData = JSON.parse(stored);
      setEvaluationData(data);

      // Organize CMO data
      const organized = organizeEvaluationData(data.selectedCMOs);
      setOrganizedData(organized);
    } else {
      // Redirect back if no data
      router.push("/");
    }
  }, [router]);

  const copyRefNo = () => {
    navigator.clipboard.writeText(refNo);
    alert("Reference number copied!");
  };

  const handleEditClick = (
    requirementId: string,
    field: "actual_situation" | "google_link"
  ) => {
    const currentValue = responses[requirementId]?.[field] || "";
    setCurrentEdit({ requirementId, field, value: currentValue });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentEdit) {
      setResponses((prev) => ({
        ...prev,
        [currentEdit.requirementId]: {
          ...(prev[currentEdit.requirementId] || {
            requirement_id: currentEdit.requirementId,
            actual_situation: "",
            google_link: "",
            hei_compliance: "",
            ched_compliance: "",
            link_accessible: "",
            ched_remarks: "",
          }),
          [currentEdit.field]: currentEdit.value,
        },
      }));
      setIsModalOpen(false);
      setCurrentEdit(null);
    }
  };

  const handleComplianceChange = (requirementId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [requirementId]: {
        ...(prev[requirementId] || {
          requirement_id: requirementId,
          actual_situation: "",
          google_link: "",
          hei_compliance: "",
          ched_compliance: "",
          link_accessible: "",
          ched_remarks: "",
        }),
        hei_compliance: value as "Complied" | "Not Complied" | "",
      },
    }));
  };

  const handleSubmit = () => {
    // Here you would save the responses to a database
    console.log("Submitting evaluation:", {
      evaluationData,
      responses,
    });
    alert("Evaluation submitted successfully!");
    router.push("/");
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all entered data?")) {
      setResponses({});
    }
  };

  if (!evaluationData) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </Button>

            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                onClick={copyRefNo}
              >
                <span className="mr-2">Control No.: {refNo}</span>
                <Copy className="w-4 h-4" />
              </Badge>
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                Clear All Contents
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h2 className="font-semibold text-lg text-blue-700">
              Evaluation Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Personnel:</span>
                <p className="font-medium">{evaluationData.personnelName}</p>
              </div>
              <div>
                <span className="text-gray-600">Position:</span>
                <p className="font-medium">{evaluationData.position}</p>
              </div>
              <div>
                <span className="text-gray-600">Institution:</span>
                <p className="font-medium">{evaluationData.institution}</p>
              </div>
              <div>
                <span className="text-gray-600">Academic Year:</span>
                <p className="font-medium">{evaluationData.academicYear}</p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-primary mt-4">
            Evaluation Checklist
          </h1>
          <p className="text-sm text-muted-foreground">
            Please complete the evaluation for all selected CMOs below.
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {organizedData.map((cmoData, cmoIndex) => (
            <div key={cmoData.cmo.id} className="space-y-4">
              {/* CMO Header */}
              <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-blue-800">
                  {cmoData.cmo.cmo_number}
                </h2>
                <p className="text-blue-700">{cmoData.cmo.title}</p>
              </div>

              {/* Sections */}
              {cmoData.sections.map((section: any) => (
                <div key={section.id} className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700 mt-6">
                    {section.section_number}. {section.section_title}
                  </h3>

                  {/* Requirements Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="p-2 text-left border w-[15%]">
                            Description
                          </th>
                          <th className="p-2 text-left border w-[15%]">
                            Required Evidence
                          </th>
                          <th className="p-2 text-left border w-[20%]">
                            Actual Situation
                          </th>
                          <th className="p-2 text-left border w-[15%]">
                            Google Link
                          </th>
                          <th className="p-2 text-center border w-[12%]">
                            HEI Compliance
                          </th>
                          <th className="p-2 text-center border w-[10%]">
                            CHED Compliance
                          </th>
                          <th className="p-2 text-center border w-[8%]">
                            Link Accessible
                          </th>
                          <th className="p-2 text-left border w-[15%]">
                            CHED Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.requirements.map((requirement: any) => {
                          const response = responses[requirement.id];
                          return (
                            <tr key={requirement.id} className="border-b">
                              {/* Description */}
                              <td className="p-2 border align-top">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: requirement.description,
                                  }}
                                  className="text-xs"
                                />
                              </td>

                              {/* Required Evidence */}
                              <td className="p-2 border align-top">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: requirement.required_evidence,
                                  }}
                                  className="text-xs"
                                />
                              </td>

                              {/* Actual Situation */}
                              <td className="p-2 border align-top">
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-0 right-0 h-6 w-6 p-0"
                                    onClick={() =>
                                      handleEditClick(
                                        requirement.id,
                                        "actual_situation"
                                      )
                                    }
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  {response?.actual_situation ? (
                                    <div className="text-xs pr-8 whitespace-pre-wrap">
                                      {response.actual_situation}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">
                                      Click + to add
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Google Link */}
                              <td className="p-2 border align-top">
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute top-0 right-0 h-6 w-6 p-0"
                                    onClick={() =>
                                      handleEditClick(requirement.id, "google_link")
                                    }
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  {response?.google_link ? (
                                    <a
                                      href={response.google_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline pr-8 break-all"
                                    >
                                      {response.google_link}
                                    </a>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">
                                      Click + to add
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* HEI Compliance */}
                              <td className="p-2 border align-top">
                                <Select
                                  value={response?.hei_compliance || ""}
                                  onValueChange={(value) =>
                                    handleComplianceChange(requirement.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-full h-8 text-xs">
                                    <SelectValue placeholder="-- Select --" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Complied">
                                      Complied
                                    </SelectItem>
                                    <SelectItem value="Not Complied">
                                      Not Complied
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>

                              {/* CHED Compliance */}
                              <td className="p-2 border align-top text-center text-xs text-gray-400 italic">
                                Pending
                              </td>

                              {/* Link Accessible */}
                              <td className="p-2 border align-top text-center text-xs text-gray-400 italic">
                                -
                              </td>

                              {/* CHED Remarks */}
                              <td className="p-2 border align-top text-xs text-gray-400 italic">
                                Awaiting CHED review
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => router.push("/")}>
              Save as Draft
            </Button>
            <Button
              style={{ backgroundColor: "#2980b9" }}
              onClick={handleSubmit}
            >
              Submit Evaluation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {currentEdit?.field === "actual_situation"
                ? "Actual Situation"
                : "Google Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {currentEdit?.field === "actual_situation" ? (
              <Textarea
                value={currentEdit.value}
                onChange={(e) =>
                  setCurrentEdit({ ...currentEdit, value: e.target.value })
                }
                rows={10}
                placeholder="Enter the actual situation..."
                className="w-full"
              />
            ) : (
              <Input
                value={currentEdit?.value || ""}
                onChange={(e) =>
                  setCurrentEdit({
                    ...currentEdit!,
                    value: e.target.value,
                  })
                }
                placeholder="Enter Google Drive link or URL..."
                className="w-full"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvaluationPage;