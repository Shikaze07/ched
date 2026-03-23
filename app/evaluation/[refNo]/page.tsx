"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
interface EvaluationResponse {
  requirement_id: string;
  actual_situation: string;
  google_link: string;
  hei_compliance: "Complied" | "Not Complied" | "";
  ched_compliance: "Complied" | "Not Complied" | "";
  link_accessible: "Yes" | "No" | "";
  ched_remarks: string;
}
import { Copy, Plus, ArrowLeft, Save, Info, Pencil, CheckCircle, AlertTriangle, Printer } from "lucide-react";
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

const toRoman = (num: number): string => {
  const map: { [key: string]: number } = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = '';
  for (let key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result;
};

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
  const [isDescOpen, setIsDescOpen] = useState(false);

  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Description */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <div className="flex items-start gap-2">
          <div className="flex-1 text-xs leading-relaxed break-words max-h-24 overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: requirement.description }} />
          </div>
        </div>
        <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Requirement Description</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm">
              <div dangerouslySetInnerHTML={{ __html: requirement.description }} />
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDescOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>

      {/* Required Evidence */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <div className="text-xs leading-relaxed break-words max-h-24 overflow-hidden">
          {requirement.required_evidence || "N/A"}
        </div>
      </td>

      {/* Actual Situation */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <div className="relative group min-h-[40px]">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-0 right-0 h-6 w-6 p-0 bg-white shadow-sm border-blue-200 print:hidden"
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
            <p className="text-[10px] text-gray-400 italic pr-8">Click button to add</p>
          )}
        </div>
      </td>

      {/* Google Link */}
      <td className="p-2 border align-top max-w-0 w-[12.5%]">
        <div className="relative group min-h-[40px]">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-0 right-0 h-6 w-6 p-0 bg-white shadow-sm border-blue-200 print:hidden"
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
            <p className="text-[10px] text-gray-400 italic pr-8">Click button to add</p>
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
            <TooltipContent><p>Log in to edit compliance</p></TooltipContent>
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
            <TooltipContent><p>Log in to edit accessibility</p></TooltipContent>
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
                  className="absolute top-0 right-0 h-6 w-6 p-0 border border-transparent hover:border-blue-100 hover:bg-blue-50 print:hidden"
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
            <TooltipContent><p>Log in to add remarks</p></TooltipContent>
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
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;

  const [allCmos, setAllCmos] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cmoRes, progRes, instRes] = await Promise.all([
          fetch("/api/cmo"),
          fetch("/api/programs"),
          fetch("/api/institution")
        ]);
        if (cmoRes.ok) setAllCmos(await cmoRes.json());
        if (progRes.ok) setAllPrograms(await progRes.json());
        if (instRes.ok) setAllInstitutions(await instRes.json());
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (isInfoModalOpen && tempInfoData && tempInfoData.selectedCMOs.length > 0 && allCmos.length > 0) {
      const selectedCmoId = tempInfoData.selectedCMOs[0];
      const cmoMetadata = allCmos.find(c => c.id === selectedCmoId);
      if (cmoMetadata?.programId) {
        const program = allPrograms.find(p => p.id === cmoMetadata.programId);
        if (program && tempInfoData.program !== program.name) {
          setTempInfoData(prev => prev ? { ...prev, program: program.name } : null);
        }
      }
    }
  }, [tempInfoData?.selectedCMOs, isInfoModalOpen, allCmos, allPrograms]);

  useEffect(() => {
    if (isInfoModalOpen && tempInfoData && tempInfoData.program && allPrograms.length > 0) {
      const program = allPrograms.find(p => p.name === tempInfoData.program);
      const cmoMetadata = allCmos.find(c => c.programId === program?.id);
      if (cmoMetadata && !tempInfoData.selectedCMOs.includes(cmoMetadata.id)) {
        setTempInfoData(prev => prev ? { ...prev, selectedCMOs: [cmoMetadata.id] } : null);
      }
    }
  }, [tempInfoData?.program, isInfoModalOpen, allCmos, allPrograms]);

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
    try {
      setIsLoadingSections(true);
      const organized = await Promise.all(data.selectedCMOs.map(async (cmoId) => {
        const checklistRes = await fetch(`/api/cmo/${cmoId}/checklist`);
        const sections = await checklistRes.json();
        const cmoMetadata = allCmos.find((c: any) => c.id === cmoId);
        return {
          cmo: {
            id: cmoId,
            cmo_number: cmoMetadata ? `CHED MEMORANDUM ORDER No. ${cmoMetadata.number}${cmoMetadata.series ? `, Series ${cmoMetadata.series}` : ""}` : "Unknown CMO",
            title: cmoMetadata?.title || "",
            series: cmoMetadata?.series || null,
          },
          sections: sections.map((s: any) => ({
            id: s.id,
            section_number: s.sectionNumber,
            section_title: s.sectionTitle,
            sort_order: s.sortOrder,
            requirements: s.requirements.map((r: any) => ({
              id: r.id,
              description: r.description,
              required_evidence: r.requiredEvidence,
              sort_order: r.sortOrder
            }))
          }))
        };
      }));

      setOrganizedData(organized);

      const sectionGroups: Record<string, any> = {};
      organized.forEach((cmoData) => {
        cmoData.sections.forEach((section: any) => {
          const title = section.section_title;
          if (!sectionGroups[title]) {
            sectionGroups[title] = { title, requirements: [], sort_order: section.sort_order };
          }
          section.requirements.forEach((req: any) => {
            sectionGroups[title].requirements.push({ ...req, cmo_id: cmoData.cmo.id, cmo_number: cmoData.cmo.cmo_number });
          });
        });
      });

      const merged = Object.values(sectionGroups).sort((a, b) => a.sort_order - b.sort_order);
      setMergedSections(merged);
    } catch (error) {
      console.error("Error setting up evaluation data:", error);
      toast.error("Failed to load checklist templates from database.");
    } finally {
      setIsLoadingSections(false);
    }

    try {
      const response = await fetch(`/api/evaluation/responses?refNo=${encodeURIComponent(data.refNo)}`);
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

    const channel = pusher.subscribe(`evaluation-${data.refNo}`);
    channel.bind("response-updated", (newResponses: Record<string, any>) => {
      setResponses(newResponses);
    });

    return () => {
      pusher.unsubscribe(`evaluation-${data.refNo}`);
    };
  }, [allCmos, refNo]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const initialize = async () => {
      const stored = sessionStorage.getItem("evaluationData");
      if (stored) {
        const data: EvaluationData = JSON.parse(stored);
        const result = await setupEvaluation(data);
        if (typeof result === 'function') cleanup = result;
      } else {
        try {
          const response = await fetch(`/api/evaluation?refNo=${encodeURIComponent(refNo)}`);
          if (response.ok) {
            const record = await response.json();
            const data: EvaluationData = {
              personnelName: record.personnelName,
              position: record.position,
              email: record.email,
              institution: record.institution,
              academicYear: record.academicYear,
              selectedCMOs: record.selectedCMOs || [],
              program: record.selectedPrograms?.[0] || "",
              orNumber: record.orNumber || "",
              dateOfEvaluation: record.dateOfEvaluation ? new Date(record.dateOfEvaluation).toISOString() : "",
              refNo: record.refNo,
            };
            const result = await setupEvaluation(data);
            if (typeof result === 'function') cleanup = result;
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching evaluation from database:", error);
          router.push("/");
        }
      }
    };
    initialize();
    return () => { cleanup?.(); };
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tempInfoData, selectedPrograms: [tempInfoData.program] }),
      });
      if (response.ok) {
        setEvaluationData(tempInfoData);
        sessionStorage.setItem("evaluationData", JSON.stringify(tempInfoData));
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
      try {
        const response = await fetch("/api/evaluation/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refNo: evaluationData.refNo, responses: updatedResponses, publishUpdate: true }),
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
      if (evaluationData) {
        fetch("/api/evaluation/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refNo: evaluationData.refNo, responses: updatedResponses, publishUpdate: true }),
        }).catch(console.error);
      }
      return updatedResponses;
    });
  }, [evaluationData]);

  const handleClearAll = () => {
    showNotify(
      "Confirm Clear",
      "Are you sure you want to clear all entered data? This action cannot be undone.",
      "confirm",
      () => setResponses({})
    );
  };

  const matchedInstName = useMemo(() => {
    if (!evaluationData) return "Not Specified";
    const inst = allInstitutions.find(i => i.id === evaluationData.institution || i.name === evaluationData.institution);
    return inst ? inst.name : evaluationData.institution;
  }, [evaluationData, allInstitutions]);

  const matchedInstAddress = useMemo(() => {
    if (!evaluationData) return "---";
    const inst = allInstitutions.find(i => i.id === evaluationData.institution || i.name === evaluationData.institution);
    return inst ? (inst as any).address || "---" : "---";
  }, [evaluationData, allInstitutions]);

  if (!evaluationData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        Loading evaluation data...
      </div>
    );
  }

  const displayedProgram = (() => {
    if (!evaluationData) return "Not Specified";
    const p = (evaluationData as any).program;
    if (!p) return "Not Specified";
    const byId = allPrograms.find((ap) => ap.id === p);
    if (byId) return byId.name;
    if (typeof p === "string") return p;
    if (typeof p === "object") return p.name || p.label || JSON.stringify(p);
    return String(p);
  })();

  return (
    <TooltipProvider>
      {/* ─── SCREEN VIEW (hidden on print) ─── */}
      <div className="print:hidden p-8">
        <Card className="shadow-lg border-blue-100">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push(isLoggedIn ? "/admin/dashboard" : "/program-assessment")}
                className="flex items-center gap-2 w-full sm:w-auto print:hidden"
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
                <Button variant="destructive" size="sm" onClick={handleClearAll} className="w-full sm:w-auto print:hidden">
                  Clear All Contents
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2 relative group">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                onClick={handleEditInfo}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <h2 className="font-semibold text-lg text-blue-700">Evaluation Information</h2>
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
                  <p className="font-medium uppercase">{matchedInstName}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold block uppercase text-[10px]">Academic Year:</span>
                  <p className="font-medium">{evaluationData.academicYear}</p>
                </div>
              </div>
              <div className="pt-2 border-t mt-2 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-gray-600 font-semibold block uppercase text-[10px] mb-1">Evaluating Program:</span>
                  <p className="text-xs font-semibold text-blue-900">{displayedProgram}</p>
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

            <h1 className="text-2xl font-bold text-primary mt-4">Evaluation Checklist</h1>
            <p className="text-sm text-muted-foreground">Complete the evaluation for all requirements across the selected CMOs.</p>
          </CardHeader>

          <CardContent className="space-y-8 p-4 md:p-6">
            {isLoadingSections ? (
              <div className="py-8 text-center text-sm text-gray-600">Loading sections…</div>
            ) : (
              mergedSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-100 pb-1 mt-6">
                    {sectionIndex + 1}. {section.title}
                  </h3>
                  <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-sm table-fixed min-w-[1000px]">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="p-2 text-left border w-[12.5%]">Description</th>
                          <th className="p-2 text-left border w-[12.5%]">Required Evidence</th>
                          <th className="p-2 text-left border w-[12.5%]">Actual Situation</th>
                          <th className="p-2 text-left border w-[12.5%]">Google Link</th>
                          <th className="p-2 text-center border w-[12.5%]">HEI Compliance <span>(C/NC)</span></th>
                          <th className="p-2 text-center border w-[12.5%]">CHED Compliance <span>(C/NC)</span></th>
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
              ))
            )}

            <div className="flex flex-col sm:justify-end gap-4 pt-6 border-t print:hidden">
              <Button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Print Evaluation Report
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
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
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
                    <Input value={tempInfoData.personnelName} onChange={(e) => setTempInfoData({ ...tempInfoData, personnelName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input value={tempInfoData.position} onChange={(e) => setTempInfoData({ ...tempInfoData, position: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={tempInfoData.email} onChange={(e) => setTempInfoData({ ...tempInfoData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>OR Number</Label>
                    <Input value={tempInfoData.orNumber} onChange={(e) => setTempInfoData({ ...tempInfoData, orNumber: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Select value={tempInfoData.institution} onValueChange={(value) => setTempInfoData({ ...tempInfoData, institution: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allInstitutions.map(inst => (
                          <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={tempInfoData.academicYear} onValueChange={(value) => setTempInfoData({ ...tempInfoData, academicYear: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Evaluation</Label>
                    <Input type="date" value={tempInfoData.dateOfEvaluation ? tempInfoData.dateOfEvaluation.split('T')[0] : ""} onChange={(e) => setTempInfoData({ ...tempInfoData, dateOfEvaluation: e.target.value })} />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-4 pt-2 border-t mt-2">
                  <div className="space-y-2">
                    <Label>CMO</Label>
                    <MultipleSelector
                      value={allCmos.filter(cmo => tempInfoData.selectedCMOs.includes(cmo.id)).map(cmo => ({ value: cmo.id, label: `${cmo.number} - ${cmo.title}` }))}
                      onChange={(options) => setTempInfoData({ ...tempInfoData, selectedCMOs: options.map(o => o.value) })}
                      options={allCmos.map(cmo => ({ value: cmo.id, label: `${cmo.number} - ${cmo.title}` }))}
                      placeholder="Select CMOs..."
                      maxSelected={1}
                      hidePlaceholderWhenSelected
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <MultipleSelector
                      value={tempInfoData.program ? [{ value: tempInfoData.program, label: tempInfoData.program }] : []}
                      onChange={(options) => setTempInfoData({ ...tempInfoData, program: options.length > 0 ? options[0].label : "" })}
                      options={allPrograms.map(p => ({ value: p.id, label: p.name }))}
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
              <Button variant="outline" onClick={() => setIsInfoModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveInfo} className="bg-blue-600 hover:bg-blue-700" disabled={isLoadingInfo}>
                {isLoadingInfo ? (
                  <><span className="inline-block animate-spin mr-2">⟳</span>Updating...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Save Information</>
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
                notifyType === "success" ? "text-green-600" : notifyType === "confirm" ? "text-amber-600" : "text-blue-600"
              )}>
                {notifyType === "success" && <CheckCircle className="h-5 w-5" />}
                {notifyType === "confirm" && <AlertTriangle className="h-5 w-5" />}
                {notifyType === "info" && <Info className="h-5 w-5" />}
                {notifyTitle}
              </DialogTitle>
              <div className="py-4 text-sm text-gray-600">{notifyMessage}</div>
            </DialogHeader>
            <DialogFooter className="flex sm:justify-end gap-2">
              {notifyType === "confirm" ? (
                <>
                  <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>Cancel</Button>
                  <Button style={{ backgroundColor: "#e74c3c" }} onClick={() => { if (onNotifyConfirm) onNotifyConfirm(); setShowNotifyDialog(false); }}>Clear All</Button>
                </>
              ) : (
                <Button style={{ backgroundColor: "#2980b9" }} onClick={() => { if (onNotifyConfirm) onNotifyConfirm(); setShowNotifyDialog(false); }}>OK</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── PRINT VIEW (hidden on screen, shown on print) ─── */}
      <div className="hidden print:block">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { margin: 0; padding: 0; background: #fff !important; font-family: Arial, sans-serif; }
            @page { size: landscape; margin: 0; }
          }
          .print-container { padding: 15mm 20mm; position: relative; min-height: 100vh; background: #fff; }
          .print-info-table td { padding: 4px 6px; border-bottom: 1px solid #ccc; font-size: 9pt; }
          .print-info-table td.lbl { font-weight: bold; width: 130px; white-space: nowrap; }
          .print-section-header { font-weight: bold; font-size: 9pt; border-bottom: 1px solid #000; padding: 3px 0; margin: 14px 0 0 0; text-transform: uppercase; }
          .print-eval-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
          .print-eval-table th { border: 1px solid #aaa; padding: 4px 5px; text-align: center; font-weight: bold; background: #fff; vertical-align: middle; }
          .print-eval-table td { border: 1px solid #aaa; padding: 4px 5px; vertical-align: top; }
          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 80pt;
            font-weight: 900;
            color: rgba(0,0,0,0.04);
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
            font-family: Arial, sans-serif;
          }
        `}} />

        <div className="print-container">
          {/* Watermark — subtle, diagonal, behind content */}
          <div className="print-watermark">Self Assessment</div>

          {/* ── HEADER: logo + agency name ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "6px" }}>
          <img
            src="/chedheader.png"
            alt="CHED Logo"
            style={{ height: "100px" }}
          />

        </div>

        {/* ── REPORT TITLE ── */}
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", marginBottom: "14px" }}>
          Self Assessment Report
        </div>

        {/* ── INSTITUTION INFO TABLE ── */}
        <table className="print-info-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
          <tbody>
            <tr>
              <td className="lbl">Institution Name:</td>
              <td style={{ width: "45%", fontWeight: 500 }}>{matchedInstName}</td>
              <td className="lbl">Academic Year:</td>
              <td>{evaluationData.academicYear}</td>
            </tr>
            <tr>
              <td className="lbl">Address:</td>
              <td style={{ width: "45%" }}>{matchedInstAddress}</td>
              <td className="lbl">OR Number:</td>
              <td>{evaluationData.orNumber || "---"}</td>
            </tr>
            <tr>
              <td className="lbl">Program Name:</td>
              <td style={{ width: "45%" }}>{displayedProgram}</td>
              <td className="lbl">Date of Evaluation:</td>
              <td>{evaluationData.dateOfEvaluation ? new Date(evaluationData.dateOfEvaluation).toLocaleDateString() : "---"}</td>
            </tr>
          </tbody>
        </table>

        {/* ── SECTIONS ── */}
        {mergedSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: "16px" }}>
            <div className="print-section-header">
              {toRoman(sIdx + 1)}. {section.title}
            </div>
            <table className="print-eval-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Description</th>
                  <th style={{ width: "15%" }}>Required Evidence</th>
                  <th style={{ width: "22%" }}>Actual Situation</th>
                  <th style={{ width: "28%" }}>Google Link</th>
                  <th style={{ width: "10%" }}>Compliance (C/NC)</th>
                </tr>
              </thead>
              <tbody>
                {section.requirements.map((req: any) => (
                  <tr key={req.id}>
                    <td>
                      <div dangerouslySetInnerHTML={{ __html: req.description }} />
                    </td>
                    <td>{req.required_evidence || "N/A"}</td>
                    <td>
                      <div dangerouslySetInnerHTML={{ __html: responses[req.id]?.actual_situation || "" }} />
                    </td>
                    <td style={{ wordBreak: "break-all" }}>
                      {responses[req.id]?.google_link ? (
                        <a
                          href={ensureExternalLink(responses[req.id]?.google_link)}
                          style={{ color: "#1a0dab", fontSize: "8pt" }}
                        >
                          {stripHtml(responses[req.id]?.google_link || "")}
                        </a>
                      ) : ""}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {responses[req.id]?.hei_compliance === "Complied" ? "C" :
                        responses[req.id]?.hei_compliance === "Not Complied" ? "NC" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "6px", fontSize: "8pt", color: "#444" }}>
          <p style={{ fontStyle: "italic", marginBottom: "3px" }}>
            Note: This data is system-generated. No signature required
          </p>
          <p style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "8.5pt", color: "#000", marginBottom: "2px" }}>
            Program Evaluation Self Assessment
          </p>
          <p style={{ marginBottom: "3px", color: "#1a0dab", fontSize: "8pt" }}>
            portal.chedro12.com/program-assessment/
          </p>
          <p style={{ fontStyle: "italic", color: "#555", fontSize: "7.5pt", lineHeight: 1.4 }}>
            Disclaimer: This data is intended to be protected under data privacy and for the exclusive use of the intended requestor.
            Any dissemination, alteration, or distribution of this document, or any part thereof or information therein, is strictly prohibited.
            If you received this data in error, kindly notify CHED Regional Office XII.
          </p>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default EvaluationPage;