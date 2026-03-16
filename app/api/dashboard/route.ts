import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [evaluations, cmos, programs, archivedCount] = await Promise.all([
            prisma.evaluationRecord.findMany({
                orderBy: { timestamp: "desc" },
            }),
            prisma.cmo.findMany({
                include: {
                    _count: {
                        select: {
                            sections: true,
                            requirements: true,
                        },
                    },
                },
            }),
            prisma.program.findMany(),
            prisma.archivedEvaluationRecord.count(),
        ]);

        // Count ready templates (those with requirements)
        const readyTemplates = cmos.filter(c => (c._count?.requirements || 0) > 0).length;

        // Calculate evaluations by CMO
        const evaluationsByCmo: Record<string, { number: string; count: number }> = {};
        cmos.forEach(cmo => {
            evaluationsByCmo[cmo.id] = { number: cmo.number, count: 0 };
        });

        evaluations.forEach(evaluation => {
            const selectedCmos = Array.isArray(evaluation.selectedCMOs) ? evaluation.selectedCMOs : [];
            selectedCmos.forEach((item: any) => {
                const id = typeof item === "string" ? item : item?.id || item?.value;
                if (id && evaluationsByCmo[id]) {
                    evaluationsByCmo[id].count++;
                }
            });
        });

        const evaluationsByCmoArray = Object.values(evaluationsByCmo)
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count);

        // Calculate evaluations by program
        const evaluationsByProgram: Record<string, { name: string; count: number }> = {};
        programs.forEach(prog => {
            evaluationsByProgram[prog.id] = { name: prog.name, count: 0 };
        });

        evaluations.forEach(evaluation => {
            const selectedPrograms = Array.isArray(evaluation.selectedPrograms) ? evaluation.selectedPrograms : [];
            selectedPrograms.forEach((item: any) => {
                const id = typeof item === "string" ? item : item?.id || item?.value;
                if (id && evaluationsByProgram[id]) {
                    evaluationsByProgram[id].count++;
                }
            });
        });

        const evaluationsByProgramArray = Object.values(evaluationsByProgram)
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count);

        // Calculate evaluations by institution (resolve institution id -> name)
        const institutions = await prisma.institution.findMany();
        const institutionMap: Record<string, string> = {};
        institutions.forEach(inst => {
            institutionMap[inst.id] = inst.name;
        });

        const evaluationsByInstitution: Record<string, number> = {};
        evaluations.forEach(evaluation => {
            const instKey = evaluation.institution || "";
            if (!evaluationsByInstitution[instKey]) {
                evaluationsByInstitution[instKey] = 0;
            }
            evaluationsByInstitution[instKey]++;
        });

        const evaluationsByInstitutionArray = Object.entries(evaluationsByInstitution)
            .map(([id, count]) => ({ name: institutionMap[id] || id, count }))
            .sort((a, b) => b.count - a.count);

        // Calculate evaluations by academic year
        const evaluationsByYear: Record<string, number> = {};
        evaluations.forEach(evaluation => {
            if (!evaluationsByYear[evaluation.academicYear]) {
                evaluationsByYear[evaluation.academicYear] = 0;
            }
            evaluationsByYear[evaluation.academicYear]++;
        });

        const evaluationsByYearArray = Object.entries(evaluationsByYear)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year));

        // Get recent evaluations (resolve institution id -> name)
        const recentEvaluations = evaluations.slice(0, 10).map(evaluation => ({
            id: evaluation.id,
            refNo: evaluation.refNo,
            personnelName: evaluation.personnelName,
            institution: institutionMap[evaluation.institution] || evaluation.institution,
            academicYear: evaluation.academicYear,
            dateOfEvaluation: evaluation.dateOfEvaluation.toISOString(),
        }));

        return NextResponse.json({
            totalEvaluations: evaluations.length,
            totalCmos: cmos.length,
            totalPrograms: programs.length,
            readyTemplates,
            archivedEvaluations: archivedCount,
            evaluationsByCmo: evaluationsByCmoArray,
            evaluationsByProgram: evaluationsByProgramArray,
            evaluationsByInstitution: evaluationsByInstitutionArray,
            evaluationsByYear: evaluationsByYearArray,
            recentEvaluations,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
