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
import {
  organizeEvaluationData,
  type EvaluationResponse,
  mockCMOs,
} from "@/lib/mockData";
import { Copy, Plus, ArrowLeft, Save, Info, Pencil, CheckCircle, AlertTriangle } from "lucide-react";
import { evaluationStore, EvaluationRecord } from "@/lib/evaluation-store";
import RichTextEditor from "../../../components/rich-text-editor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

// Utility to strip HTML tags efficiently
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};

const ensureExternalLink = (url: string) => {
  if (!url) return "";
  const stripped = stripHtml(url).trim();
  if (!stripped) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(stripped)) {
    return stripped;
  }
  return `https://${stripped}`;
};

interface RequirementRowProps {
  requirement: any;
  response: EvaluationResponse | undefined;
  onEditClick: (id: string, field: "actual_situation" | "google_link" | "ched_remarks") => void;
  onComplianceChange: (id: string, field: "hei_compliance" | "ched_compliance" | "link_accessible", value: string) => void;
}

const RequirementRow = React.memo(({
  requirement,
  response,
  onEditClick,
  onComplianceChange
}: RequirementRowProps) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Description */}
      <td className="p-2 border align-top max-w-0 w-[15%]">
        <div className="mb-2">
          <Badge variant="outline" className="text-[9px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200 uppercase font-semibold">
            {requirement.cmo_number.split(',')[0]}
          </Badge>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: requirement.description,
          }}
          className="text-xs leading-relaxed break-words"
        />
      </td>

      {/* Required Evidence */}
      <td className="p-2 border align-top max-w-0 w-[15%]">
        <div
          dangerouslySetInnerHTML={{
            __html: requirement.required_evidence,
          }}
          className="text-xs break-words"
        />
      </td>

      {/* Actual Situation */}
      <td className="p-2 border align-top max-w-0 w-[20%]">
        <div className="relative group min-h-[40px]">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-0 right-0 h-6 w-6 p-0 bg-white shadow-sm border-blue-200"
            onClick={() => onEditClick(requirement.id, "actual_situation")}
          >
            {response?.actual_situation ? (
              <Pencil className="w-3 h-3 text-blue-600" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </Button>
          {response?.actual_situation ? (
            <div
              className="text-xs leading-relaxed break-words pr-8"
              dangerouslySetInnerHTML={{ __html: response.actual_situation }}
            />
          ) : (
            <p className="text-[10px] text-gray-400 italic pr-8">
              Click button to add
            </p>
          )}
        </div>
      </td>

      {/* Google Link */}
      <td className="p-2 border align-top max-w-0 w-[15%]">
        <div className="relative group min-h-[40px]">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-0 right-0 h-6 w-6 p-0 bg-white shadow-sm border-blue-200"
            onClick={() => onEditClick(requirement.id, "google_link")}
          >
            {response?.google_link ? (
              <Pencil className="w-3 h-3 text-blue-600" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </Button>
          {response?.google_link ? (
            <div className="pr-8">
              <a
                href={ensureExternalLink(response.google_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs leading-relaxed text-blue-600 hover:underline break-all"
              >
                {stripHtml(response.google_link)}
              </a>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 italic pr-8">
              Click button to add
            </p>
          )}
        </div>
      </td>

      {/* HEI Compliance */}
      <td className="p-2 border align-top w-[10%]">
        <Select
          value={response?.hei_compliance || ""}
          onValueChange={(value) => onComplianceChange(requirement.id, "hei_compliance", value)}
        >
          <SelectTrigger className="w-full h-8 text-[11px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Complied">C</SelectItem>
            <SelectItem value="Not Complied">NC</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* CHED Compliance */}
      <td className="p-2 border align-top w-[10%]">
        <Select
          value={response?.ched_compliance || ""}
          onValueChange={(value) => onComplianceChange(requirement.id, "ched_compliance", value)}
        >
          <SelectTrigger className="w-full h-8 text-[11px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Complied">C</SelectItem>
            <SelectItem value="Not Complied">NC</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* Is Link Accessible? */}
      <td className="p-2 border align-top w-[8%]">
        <Select
          value={response?.link_accessible || ""}
          onValueChange={(value) => onComplianceChange(requirement.id, "link_accessible", value)}
        >
          <SelectTrigger className="w-full h-8 text-[11px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* CHED Remarks */}
      <td className="p-2 border align-top max-w-0 w-[7%]">
        <div className="relative group min-h-[30px]">
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-0 right-0 h-6 w-6 p-0 border border-transparent hover:border-blue-100 hover:bg-blue-50"
            onClick={() => onEditClick(requirement.id, "ched_remarks")}
          >
            {response?.ched_remarks ? (
              <Pencil className="w-3 h-3 text-blue-600" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </Button>
          <div
            className="text-xs leading-relaxed text-gray-600 break-words pr-8"
            dangerouslySetInnerHTML={{ __html: response?.ched_remarks || "" }}
          />
        </div>
      </td>
    </tr>
  );
});

RequirementRow.displayName = "RequirementRow";

const EvaluationPage = () => {
  const params = useParams();
  const router = useRouter();
  const refNo = params.refNo as string;

  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [organizedData, setOrganizedData] = useState<any[]>([]);
  const [mergedSections, setMergedSections] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, EvaluationResponse>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{
    requirementId: string;
    field: "actual_situation" | "google_link" | "ched_remarks";
    value: string;
  } | null>(null);

  // Notification states
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState<"info" | "success" | "confirm">("info");
  const [onNotifyConfirm, setOnNotifyConfirm] = useState<(() => void) | null>(null);

  const showNotify = (
    title: string,
    message: string,
    type: "info" | "success" | "confirm" = "info",
    onConfirm?: () => void
  ) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setOnNotifyConfirm(() => onConfirm || null);
    setShowNotifyDialog(true);
  };

  useEffect(() => {
    // Load evaluation data from sessionStorage
    const stored = sessionStorage.getItem("evaluationData");
    if (stored) {
      const data: EvaluationData = JSON.parse(stored);
      setEvaluationData(data);

      // Organize CMO data
      const organized = organizeEvaluationData(data.selectedCMOs);
      setOrganizedData(organized);

      // Merge sections from all CMOs
      const sectionGroups: Record<string, any> = {};
      organized.forEach((cmoData) => {
        cmoData.sections.forEach((section: any) => {
          const title = section.section_title;
          if (!sectionGroups[title]) {
            sectionGroups[title] = {
              title: title,
              requirements: [],
              sort_order: section.sort_order,
            };
          }
          // Add requirements from this CMO's section
          section.requirements.forEach((req: any) => {
            sectionGroups[title].requirements.push({
              ...req,
              cmo_id: cmoData.cmo.id,
              cmo_number: cmoData.cmo.cmo_number,
            });
          });
        });
      });

      // Convert back to sorted array
      const merged = Object.values(sectionGroups).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      setMergedSections(merged);

      // Load existing responses if any
      const existingRecord = evaluationStore.getRecordByRefNo(data.refNo);
      if (existingRecord && (existingRecord as any).responses) {
        setResponses((existingRecord as any).responses);
      }
    } else {
      // Redirect back if no data
      router.push("/");
    }
  }, [router]);

  // Auto-save whenever responses change
  useEffect(() => {
    if (evaluationData && Object.keys(responses).length > 0) {
      const updatedRecord = {
        ...evaluationData,
        responses: responses,
        timestamp: Date.now(),
      };
      evaluationStore.saveRecord(updatedRecord as any);

    }
  }, [responses, evaluationData]);

  const copyRefNo = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(refNo);
      toast.success("Reference number copied to clipboard!");
    }
  };

  const handleEditClick = React.useCallback((
    requirementId: string,
    field: "actual_situation" | "google_link" | "ched_remarks"
  ) => {
    setResponses(prev => {
      const currentValue = prev[requirementId]?.[field] || "";
      setCurrentEdit({ requirementId, field, value: currentValue });
      setIsModalOpen(true);
      return prev;
    });
  }, []);

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
      // Toast for modal save is okay as it's a discrete action
      toast.success("Changes saved!");
    }
  };

  const handleComplianceChange = React.useCallback((
    requirementId: string,
    field: "hei_compliance" | "ched_compliance" | "link_accessible",
    value: string
  ) => {
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
        [field]: value,
      },
    }));
  }, []);

  const handleSubmit = () => {
    // Final save before submission
    if (evaluationData) {
      const updatedRecord = {
        ...evaluationData,
        responses: responses,
        timestamp: Date.now(),
      };
      evaluationStore.saveRecord(updatedRecord as any);

      toast.success("Evaluation submitted successfully!");
      router.push("/program-assessment");
    }
  };

  const handleClearAll = () => {
    showNotify(
      "Confirm Clear",
      "Are you sure you want to clear all entered data? This action cannot be undone.",
      "confirm",
      () => setResponses({})
    );
  };

  if (!evaluationData) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push("/program-assessment")}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <div className="flex flex-col items-start sm:items-end">
                <Badge
                  variant="outline"
                  className="py-2 px-4 cursor-pointer hover:bg-gray-100 flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto"
                  onClick={copyRefNo}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-normal">Control No.:</span>
                    <span className="font-semibold">{refNo}</span>
                  </div>
                  <Copy className="w-3 h-3 text-gray-400" />
                </Badge>
                <span className="text-[9px] text-green-600 mt-1 flex items-center gap-1 font-medium italic">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Changes saved automatically
                </span>
              </div>
              <Button variant="destructive" size="sm" onClick={handleClearAll} className="w-full sm:w-auto">
                Clear All Contents
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h2 className="font-semibold text-lg text-blue-700">
              Evaluation Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-semibold block uppercase text-[10px]">Personnel:</span>
                <p className="font-medium">{evaluationData.personnelName}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold block uppercase text-[10px]">Position:</span>
                <p className="font-medium">{evaluationData.position}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold block uppercase text-[10px]">Institution:</span>
                <p className="font-medium uppercase">{evaluationData.institution}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold block uppercase text-[10px]">Academic Year:</span>
                <p className="font-medium">{evaluationData.academicYear}</p>
              </div>
            </div>
            {/* List of CMOs in header */}
            <div className="pt-2 border-t mt-2">
              <span className="text-gray-600 font-semibold block uppercase text-[10px] mb-1">Evaluating CMOs:</span>
              <div className="flex flex-wrap gap-2">
                {organizedData.map(cmoData => (
                  <Badge key={cmoData.cmo.id} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    {cmoData.cmo.cmo_number}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-primary mt-4">
            Evaluation Checklist
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete the evaluation for all requirements across the selected CMOs.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 p-4 md:p-6">
          {mergedSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-100 pb-1 mt-6">
                {sectionIndex + 1}. {section.title}
              </h3>

              {/* Requirements Table */}
              <div className="overflow-x-auto border rounded-lg shadow-sm">
                {/* table-fixed enforces prefixes, min-w ensures scroll on mobile */}
                <table className="w-full text-sm table-fixed min-w-[1000px]">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 text-left border w-[15%]">Description</th>
                      <th className="p-2 text-left border w-[15%]">Required Evidence</th>
                      <th className="p-2 text-left border w-[20%]">Actual Situation</th>
                      <th className="p-2 text-left border w-[15%]">Google Link</th>
                      <th className="p-2 text-center border w-[10%]">HEI Compliance</th>
                      <th className="p-2 text-center border w-[10%]">CHED Compliance</th>
                      <th className="p-2 text-center border w-[8%]">Link Accessible</th>
                      <th className="p-2 text-left border w-[7%]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.requirements.map((requirement: any) => (
                      <RequirementRow
                        key={requirement.id}
                        requirement={requirement}
                        response={responses[requirement.id]}
                        onEditClick={handleEditClick}
                        onComplianceChange={handleComplianceChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:justify-end gap-4 pt-6 border-t">
            <Button
              style={{ backgroundColor: "#2980b9" }}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8"
            >
              <CheckCircle className="w-4 h-4" />
              Finalize & Submit Evaluation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-blue-700">
              {currentEdit?.field === "actual_situation" ? "Edit Actual Situation" :
                currentEdit?.field === "google_link" ? "Edit Google Link" : "Edit CHED Remarks"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden py-4">
            <RichTextEditor
              title=""
              value={currentEdit?.value || ""}
              onChange={(value) => setCurrentEdit(prev => prev ? { ...prev, value } : null)}
              onSave={handleSaveEdit}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(
              "flex items-center gap-2",
              notifyType === "success" ? "text-green-600" :
                notifyType === "confirm" ? "text-amber-600" : "text-blue-600"
            )}>
              {notifyType === "success" && <CheckCircle className="h-5 w-5" />}
              {notifyType === "confirm" && <AlertTriangle className="h-5 w-5" />}
              {notifyType === "info" && <Info className="h-5 w-5" />}
              {notifyTitle}
            </DialogTitle>
            <div className="py-4 text-sm text-gray-600">
              {notifyMessage}
            </div>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2">
            {notifyType === "confirm" ? (
              <>
                <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
                  Cancel
                </Button>
                <Button
                  style={{ backgroundColor: "#e74c3c" }}
                  onClick={() => {
                    if (onNotifyConfirm) onNotifyConfirm();
                    setShowNotifyDialog(false);
                  }}
                >
                  Clear All
                </Button>
              </>
            ) : (
              <Button
                style={{ backgroundColor: "#2980b9" }}
                onClick={() => {
                  if (onNotifyConfirm) onNotifyConfirm();
                  setShowNotifyDialog(false);
                }}
              >
                OK
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvaluationPage;