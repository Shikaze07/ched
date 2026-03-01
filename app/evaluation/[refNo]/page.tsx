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
  programOptions,
  getAssociatedPrograms,
  getProgramOptionsByIds,
  getAssociatedCMOs,
  getCMOOptionsByIds
} from "@/lib/mockData";
import { Copy, Plus, ArrowLeft, Save, Info, Pencil, CheckCircle, AlertTriangle } from "lucide-react";
import { evaluationStore, EvaluationRecord } from "@/lib/evaluation-store";
import RichTextEditor from "../../../components/rich-text-editor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import pusher from "@/lib/pusher";
import MultipleSelector, { Option } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  isLoggedIn: boolean;
}

const RequirementRow = React.memo(({
  requirement,
  response,
  onEditClick,
  onComplianceChange,
  isLoggedIn
}: RequirementRowProps) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Description */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
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
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <div
          dangerouslySetInnerHTML={{
            __html: requirement.required_evidence,
          }}
          className="text-xs break-words"
        />
      </td>

      {/* Actual Situation */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
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
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
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
      <td className="p-2 border align-top w-[12.5%]">
        <Select
          value={response?.hei_compliance || ""}
          onValueChange={(value) => onComplianceChange(requirement.id, "hei_compliance", value)}
        >
          <SelectTrigger className="w-full h-8 text-[11px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Complied">Complied</SelectItem>
            <SelectItem value="Not Complied">Not Complied</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* CHED Compliance */}
      <td className="p-2 border align-top w-[12.5%]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(!isLoggedIn && "opacity-50 cursor-not-allowed")}
              onClick={() => !isLoggedIn && toast.info("Please login to edit CHED compliance")}
            >
              <Select
                value={response?.ched_compliance || ""}
                onValueChange={(value) => onComplianceChange(requirement.id, "ched_compliance", value)}
                disabled={!isLoggedIn}
              >
                <SelectTrigger className="w-full h-8 text-[11px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Complied">Complied</SelectItem>
                  <SelectItem value="Not Complied">Not Complied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {!isLoggedIn && (
            <TooltipContent>
              <p>Log in to edit compliance</p>
            </TooltipContent>
          )}
        </Tooltip>
      </td>

      {/* Is Link Accessible? */}
      <td className="p-2 border align-top w-[12.5%]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(!isLoggedIn && "opacity-50 cursor-not-allowed")}
              onClick={() => !isLoggedIn && toast.info("Please login to edit link accessibility")}
            >
              <Select
                value={response?.link_accessible || ""}
                onValueChange={(value) => onComplianceChange(requirement.id, "link_accessible", value)}
                disabled={!isLoggedIn}
              >
                <SelectTrigger className="w-full h-8 text-[11px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {!isLoggedIn && (
            <TooltipContent>
              <p>Log in to edit accessibility</p>
            </TooltipContent>
          )}
        </Tooltip>
      </td>

      {/* CHED Remarks */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="relative group min-h-[30px] cursor-pointer"
              onClick={() => !isLoggedIn && toast.info("Please login to add remarks")}
            >
              {isLoggedIn && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0 right-0 h-6 w-6 p-0 border border-transparent hover:border-blue-100 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(requirement.id, "ched_remarks");
                  }}
                >
                  {response?.ched_remarks ? (
                    <Pencil className="w-3 h-3 text-blue-600" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </Button>
              )}
              {response?.ched_remarks ? (
                <div
                  className="text-xs leading-relaxed text-gray-600 break-words pr-8"
                  dangerouslySetInnerHTML={{ __html: response?.ched_remarks || "" }}
                />
              ) : (
                <p className={cn("text-[10px] italic pr-8", !isLoggedIn ? "text-amber-600 font-medium" : "text-gray-400")}>
                  {!isLoggedIn ? "Please login to add remarks" : "Click button to add"}
                </p>
              )}
            </div>
          </TooltipTrigger>
          {!isLoggedIn && (
            <TooltipContent>
              <p>Log in to add remarks</p>
            </TooltipContent>
          )}
        </Tooltip>
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

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [tempInfoData, setTempInfoData] = useState<EvaluationData | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;

  // Sync Program when CMO changes (similar to program-assessment page)
  useEffect(() => {
    if (isInfoModalOpen && tempInfoData && tempInfoData.selectedCMOs.length > 0) {
      const associatedProgramIds = getAssociatedPrograms(tempInfoData.selectedCMOs);
      const associatedProgramOptions = getProgramOptionsByIds(associatedProgramIds);

      if (associatedProgramOptions.length > 0) {
        // If current program is not in associated programs, auto-select the first one
        const isCurrentProgramAssociated = associatedProgramOptions.some(
          opt => opt.label === tempInfoData.program
        );

        if (!isCurrentProgramAssociated) {
          setTempInfoData(prev => prev ? {
            ...prev,
            program: associatedProgramOptions[0].label
          } : null);
        }
      }
    }
  }, [tempInfoData?.selectedCMOs, isInfoModalOpen]);

  // Sync CMO when Program changes (similar to program-assessment page)
  useEffect(() => {
    if (isInfoModalOpen && tempInfoData && tempInfoData.program) {
      // Find the program value/id from label
      const programOpt = programOptions.find(opt => opt.label === tempInfoData.program);
      if (programOpt) {
        const associatedCMOIds = getAssociatedCMOs([programOpt.value]);

        // If current CMO is not in associated CMOs, auto-select the first one
        const isCurrentCMOAssociated = tempInfoData.selectedCMOs.some(
          cmoId => associatedCMOIds.includes(cmoId)
        );

        if (!isCurrentCMOAssociated && associatedCMOIds.length > 0) {
          setTempInfoData(prev => prev ? {
            ...prev,
            selectedCMOs: [associatedCMOIds[0]]
          } : null);
        }
      }
    }
  }, [tempInfoData?.program, isInfoModalOpen]);

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

  const setupEvaluation = React.useCallback(async (data: EvaluationData) => {
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
        section.requirements.forEach((req: any) => {
          sectionGroups[title].requirements.push({
            ...req,
            cmo_id: cmoData.cmo.id,
            cmo_number: cmoData.cmo.cmo_number,
          });
        });
      });
    });

    const merged = Object.values(sectionGroups).sort(
      (a, b) => a.sort_order - b.sort_order
    );
    setMergedSections(merged);

    // Load existing responses from database
    try {
      const response = await fetch(
        `/api/evaluation/responses?refNo=${encodeURIComponent(data.refNo)}`
      );
      if (response.ok) {
        const dbResponses = await response.json();
        setResponses(dbResponses);
      } else {
        const existingRecord = evaluationStore.getRecordByRefNo(data.refNo);
        if (existingRecord && (existingRecord as any).responses) {
          setResponses((existingRecord as any).responses);
        }
      }
    } catch (error) {
      console.error("Error loading responses from database:", error);
      const existingRecord = evaluationStore.getRecordByRefNo(data.refNo);
      if (existingRecord && (existingRecord as any).responses) {
        setResponses((existingRecord as any).responses);
      }
    }

    // Subscribe to real-time updates via Pusher
    const channel = pusher.subscribe(`evaluation-${data.refNo}`);
    channel.bind("response-updated", (newResponses: Record<string, any>) => {
      console.log("Received real-time update:", newResponses);
      setResponses(newResponses);
    });

    return () => {
      pusher.unsubscribe(`evaluation-${data.refNo}`);
    };
  }, [refNo]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      // Load evaluation data from sessionStorage first
      const stored = sessionStorage.getItem("evaluationData");
      if (stored) {
        const data: EvaluationData = JSON.parse(stored);
        const result = await setupEvaluation(data);
        if (typeof result === 'function') cleanup = result;
      } else {
        // No sessionStorage data — try fetching from the database using the refNo in the URL
        try {
          const response = await fetch(
            `/api/evaluation?refNo=${encodeURIComponent(refNo)}`
          );
          if (response.ok) {
            const record = await response.json();
            // Reconstruct EvaluationData from the database record
            const data: EvaluationData = {
              personnelName: record.personnelName,
              position: record.position,
              email: record.email,
              institution: record.institution,
              academicYear: record.academicYear,
              selectedCMOs: record.selectedCMOs || [],
              program: record.selectedPrograms?.[0] || "",
              orNumber: record.orNumber || "",
              dateOfEvaluation: record.dateOfEvaluation
                ? new Date(record.dateOfEvaluation).toISOString()
                : "",
              refNo: record.refNo,
            };
            const result = await setupEvaluation(data);
            if (typeof result === 'function') cleanup = result;
          } else {
            // Record not found — redirect home
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching evaluation from database:", error);
          router.push("/");
        }
      }
    };

    initialize();

    return () => {
      cleanup?.();
    };
  }, [router, refNo, setupEvaluation]);

  const handleEditInfo = () => {
    if (evaluationData) {
      setTempInfoData({ ...evaluationData });
      setIsInfoModalOpen(true);
    }
  };

  const handleSaveInfo = async () => {
    if (!tempInfoData) return;

    setIsLoadingInfo(true);
    try {
      const response = await fetch("/api/evaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tempInfoData,
          selectedPrograms: [tempInfoData.program],
        }),
      });

      if (response.ok) {
        // Update local state and sessionStorage
        setEvaluationData(tempInfoData);
        sessionStorage.setItem("evaluationData", JSON.stringify(tempInfoData));

        // Refresh checklist logic if CMOs changed
        setupEvaluation(tempInfoData);

        setIsInfoModalOpen(false);
        toast.success("Evaluation information updated successfully!");
      } else {
        toast.error("Failed to update evaluation information.");
      }
    } catch (error) {
      console.error("Error saving info:", error);
      toast.error("Error saving information.");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // Don't save to local storage - only keep in memory
  // useEffect(() => {
  //   if (!evaluationData) return;
  //   evaluationStore.saveRecord(updatedRecord as any);
  // }, [responses, evaluationData]);

  // Function to save responses to database and publish to Pusher
  const saveResponsesToDatabase = async () => {
    if (!evaluationData) return false;

    try {
      const response = await fetch("/api/evaluation/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refNo: evaluationData.refNo,
          responses: responses,
          publishUpdate: true, // Flag to trigger Pusher broadcast
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      return true;
    } catch (error) {
      console.error("Error saving to database:", error);
      return false;
    }
  };

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

  const handleSaveEdit = async () => {
    if (currentEdit && evaluationData) {
      // Update responses with the new edit
      const updatedResponses = {
        ...responses,
        [currentEdit.requirementId]: {
          ...(responses[currentEdit.requirementId] || {
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
      };

      setResponses(updatedResponses);
      setIsModalOpen(false);

      // Save to database immediately when user clicks save in modal
      try {
        const response = await fetch("/api/evaluation/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refNo: evaluationData.refNo,
            responses: updatedResponses,
            publishUpdate: true,
          }),
        });

        if (response.ok) {
          toast.success("Changes saved!");
        } else {
          toast.error("Failed to save changes");
        }
      } catch (error) {
        console.error("Error saving modal changes:", error);
        toast.error("Error saving changes");
      }
    }
  };

  const handleComplianceChange = React.useCallback((
    requirementId: string,
    field: "hei_compliance" | "ched_compliance" | "link_accessible",
    value: string
  ) => {
    setResponses((prev) => {
      const updatedResponses = {
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
      };

      // Save to database immediately when compliance changes
      if (evaluationData) {
        const saveToDb = async () => {
          try {
            const response = await fetch("/api/evaluation/responses", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refNo: evaluationData.refNo,
                responses: updatedResponses,
                publishUpdate: true,
              }),
            });

            if (!response.ok) {
              console.error("Failed to save compliance change");
            }
          } catch (error) {
            console.error("Error saving compliance change:", error);
          }
        };

        saveToDb();
      }

      return updatedResponses;
    });
  }, [evaluationData]);

  const handleSubmit = async () => {
    // Save to database before submission
    if (evaluationData) {
      setIsSubmitting(true);
      try {
        const saved = await saveResponsesToDatabase();

        if (saved) {
          toast.success("Evaluation saved and submitted successfully!");
          router.push("/program-assessment");
        } else {
          toast.error("Failed to save evaluation. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting evaluation:", error);
        toast.error("Error submitting evaluation.");
      } finally {
        setIsSubmitting(false);
      }
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
    <TooltipProvider>
      <div className="p-8">
        <Card className="shadow-lg border-blue-100">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push(isLoggedIn ? "/admin/dashboard" : "/program-assessment")}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                {isLoggedIn ? "Go back to Dashboard" : "Back to Form"}
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

            <div className="bg-blue-50 p-4 rounded-lg space-y-2 relative group">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditInfo}
              >
                <Pencil className="w-4 h-4" />
              </Button>
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
              <div className="pt-2 border-t mt-2 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-gray-600 font-semibold block uppercase text-[10px] mb-1">Evaluating Program:</span>
                  <p className="text-xs font-semibold text-blue-900">{evaluationData.program || "Not Specified"}</p>
                </div>
                <div className="flex-1">
                  <span className="text-gray-600 font-semibold block uppercase text-[10px] mb-1">Evaluating CMOs:</span>
                  <div className="flex flex-wrap gap-2">
                    {organizedData.map(cmoData => (
                      <Badge key={cmoData.cmo.id} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                        {cmoData.cmo.cmo_number}
                      </Badge>
                    ))}
                  </div>
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
                        <th className="p-2 text-left border w-[12.5%]">Description</th>
                        <th className="p-2 text-left border w-[12.5%]">Required Evidence</th>
                        <th className="p-2 text-left border w-[12.5%]">Actual Situation</th>
                        <th className="p-2 text-left border w-[12.5%]">Google Link</th>
                        <th className="p-2 text-center border w-[12.5%]">HEI Compliance <span >(C/NC)</span></th>
                        <th className="p-2 text-center border w-[12.5%]">CHED Compliance <span >(C/NC)</span></th>
                        <th className="p-2 text-center border w-[12.5%]">Link Accessible</th>
                        <th className="p-2 text-left border w-[12.5%]">Remarks</th>
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
                          isLoggedIn={isLoggedIn}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Finalize & Submit Evaluation
                  </>
                )}
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

        {/* Edit Evaluation Information Modal */}
        <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700 flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Evaluation Information
              </DialogTitle>
            </DialogHeader>

            {tempInfoData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Personnel Name</Label>
                    <Input
                      value={tempInfoData.personnelName}
                      onChange={(e) => setTempInfoData({ ...tempInfoData, personnelName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={tempInfoData.position}
                      onChange={(e) => setTempInfoData({ ...tempInfoData, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={tempInfoData.email}
                      onChange={(e) => setTempInfoData({ ...tempInfoData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>OR Number</Label>
                    <Input
                      value={tempInfoData.orNumber}
                      onChange={(e) => setTempInfoData({ ...tempInfoData, orNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Select
                      value={tempInfoData.institution}
                      onValueChange={(value) => setTempInfoData({ ...tempInfoData, institution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university-of-manila">University of Manila</SelectItem>
                        <SelectItem value="technological-institute">Technological Institute of the Philippines</SelectItem>
                        <SelectItem value="state-university">Philippine State University</SelectItem>
                        <SelectItem value="sti-college-koronadal">STI COLLEGE KORONADAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select
                      value={tempInfoData.academicYear}
                      onValueChange={(value) => setTempInfoData({ ...tempInfoData, academicYear: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Evaluation</Label>
                    <Input
                      type="date"
                      value={tempInfoData.dateOfEvaluation ? tempInfoData.dateOfEvaluation.split('T')[0] : ""}
                      onChange={(e) => setTempInfoData({ ...tempInfoData, dateOfEvaluation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-2 border-t mt-2">
                  <div className="space-y-2">
                    <Label>CMO</Label>
                    <MultipleSelector
                      value={mockCMOs
                        .filter(cmo => tempInfoData.selectedCMOs.includes(cmo.id))
                        .map(cmo => ({ value: cmo.id, label: `${cmo.cmo_number} - ${cmo.title}` }))
                      }
                      onChange={(options) => setTempInfoData({
                        ...tempInfoData,
                        selectedCMOs: options.map(o => o.value)
                      })}
                      options={mockCMOs.map(cmo => ({ value: cmo.id, label: `${cmo.cmo_number} - ${cmo.title}` }))}
                      placeholder="Select CMOs..."
                      maxSelected={1}
                      hidePlaceholderWhenSelected
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <MultipleSelector
                      value={tempInfoData.program ? [{ value: tempInfoData.program, label: tempInfoData.program }] : []}
                      onChange={(options) => setTempInfoData({
                        ...tempInfoData,
                        program: options.length > 0 ? options[0].label : ""
                      })}
                      options={programOptions}
                      placeholder="Select Program..."
                      maxSelected={1}
                      creatable
                      hidePlaceholderWhenSelected
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsInfoModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveInfo}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoadingInfo}
              >
                {isLoadingInfo ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Information
                  </>
                )}
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
    </TooltipProvider>
  );
};

export default EvaluationPage;