// lib/evaluation-store.ts

export interface EvaluationRecord {
    personnelName: string;
    position: string;
    email: string;
    institution: string;
    academicYear: string;
    selectedCMOs: string[];
    selectedPrograms: any[];
    refNo: string;
    orNumber: string;
    dateOfEvaluation: string;
    timestamp: number;
}

const STORAGE_KEY = "ched_evaluation_records";

export const evaluationStore = {
    saveRecord: (record: EvaluationRecord) => {
        try {
            const records = evaluationStore.getAllRecords();
            const existingIndex = records.findIndex((r) => r.refNo === record.refNo);

            if (existingIndex > -1) {
                records[existingIndex] = { ...record, timestamp: Date.now() };
            } else {
                records.push({ ...record, timestamp: Date.now() });
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error("Error saving evaluation record:", error);
        }
    },

    getAllRecords: (): EvaluationRecord[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Error reading evaluation records:", error);
            return [];
        }
    },

    searchRecords: (query: string): EvaluationRecord[] => {
        const records = evaluationStore.getAllRecords();
        const q = query.toLowerCase().trim();

        if (!q) return [];

        return records.filter(
            (r) =>
                r.personnelName.toLowerCase().includes(q) ||
                r.refNo.toLowerCase().includes(q)
        );
    },

    getRecordByRefNo: (refNo: string): EvaluationRecord | undefined => {
        const records = evaluationStore.getAllRecords();
        return records.find((r) => r.refNo === refNo);
    }
};
