import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const archived = await executeQuery(
            () => prisma.archivedEvaluationRecord.findMany({
                orderBy: {
                    archivedAt: "desc",
                },
            }),
            25000
        );
        return NextResponse.json(archived);
    } catch (error) {
        console.error("Error fetching archived evaluations:", error);
        return NextResponse.json({ error: "Failed to fetch archived evaluations" }, { status: 500 });
    }
}
