import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const cmos = await executeQuery(
            () => prisma.cmo.findMany({
                include: {
                    program: true,
                    _count: {
                        select: {
                            sections: true,
                            requirements: true,
                        }
                    }
                },
                orderBy: {
                    series: 'desc'
                }
            }),
            25000
        );
        return NextResponse.json(cmos);
    } catch (error) {
        console.error("Error fetching CMOs:", error);
        return NextResponse.json({ error: "Failed to fetch CMOs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, number, title, series, programId } = body;

        if (!number || !title || !series) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await executeQuery(async () => {
            if (id) {
                // Update existing
                return await prisma.cmo.update({
                    where: { id },
                    data: {
                        number,
                        title,
                        series: parseInt(series.toString()),
                        programId: programId || null
                    },
                });
            } else {
                // Create new
                return await prisma.cmo.create({
                    data: {
                        number,
                        title,
                        series: parseInt(series.toString()),
                        programId: programId || null
                    },
                });
            }
        }, 25000);

        return NextResponse.json({ success: true, cmo: result }, { status: id ? 200 : 201 });
    } catch (error) {
        console.error("Error saving CMO:", error);
        return NextResponse.json({ error: "Failed to save CMO" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing CMO ID" }, { status: 400 });
        }

        await executeQuery(
            async () => {
                // Get CMO details
                const cmo = await prisma.cmo.findUnique({
                    where: { id },
                });

                if (!cmo) {
                    throw new Error("CMO not found");
                }

                // Find all evaluation records that reference this CMO
                const evaluations = await prisma.evaluationRecord.findMany({
                    where: {
                        selectedCMOs: {
                            string_contains: `"${id}"`,
                        }
                    },
                    include: {
                        responses: true,
                    }
                });

                // Archive evaluations before deleting
                for (const evaluation of evaluations) {
                    await prisma.archivedEvaluationRecord.create({
                        data: {
                            originalId: evaluation.id,
                            personnelName: evaluation.personnelName,
                            position: evaluation.position,
                            email: evaluation.email,
                            institution: evaluation.institution,
                            academicYear: evaluation.academicYear,
                            selectedCMOs: evaluation.selectedCMOs as any,
                            selectedPrograms: evaluation.selectedPrograms as any,
                            refNo: evaluation.refNo,
                            orNumber: evaluation.orNumber,
                            dateOfEvaluation: evaluation.dateOfEvaluation,
                            timestamp: evaluation.timestamp,
                            archivedCmoId: cmo.id,
                            archivedCmoNumber: cmo.number,
                            archivedCmoTitle: cmo.title,
                            responses: evaluation.responses as any,
                        },
                    });
                }

                // Delete the CMO (cascade will handle sections, requirements, responses)
                await prisma.cmo.delete({
                    where: { id },
                });

                return { archivedCount: evaluations.length };
            },
            25000
        );

        return NextResponse.json({ 
            success: true,
            message: "Template deleted. Any related evaluations are archived."
        });
    } catch (error) {
        console.error("Error deleting CMO:", error);
        return NextResponse.json({ error: "Failed to delete CMO" }, { status: 500 });
    }
}
