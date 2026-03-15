import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const records = await executeQuery(
            () => prisma.evaluationRecord.findMany({
                orderBy: {
                    timestamp: "desc",
                },
            }),
            25000
        );
        return NextResponse.json(records);
    } catch (error) {
        console.error("Error fetching evaluation records:", error);
        return NextResponse.json({ error: "Failed to fetch evaluation records" }, { status: 500 });
    }
}
