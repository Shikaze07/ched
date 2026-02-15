// app/api/cmo/programs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAssociatedPrograms, getProgramOptionsByIds } from "@/lib/mockData";

export async function POST(request: NextRequest) {
    try {
        const { cmo_ids } = await request.json();

        if (!cmo_ids || !Array.isArray(cmo_ids)) {
            return NextResponse.json(
                { status: "error", message: "Invalid CMO IDs" },
                { status: 400 }
            );
        }

        const programIds = getAssociatedPrograms(cmo_ids);
        const programs = getProgramOptionsByIds(programIds);

        return NextResponse.json({
            status: "success",
            data: programs.map((p) => ({
                programID: p.value,
                programName: p.label,
                selected: 1,
            })),
        });
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: "Server error" },
            { status: 500 }
        );
    }
}