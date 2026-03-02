import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: cmoId } = await params;

        if (!cmoId) {
            return NextResponse.json({ error: "Missing CMO ID" }, { status: 400 });
        }

        const sections = await executeQuery(
            () => prisma.section.findMany({
                where: { cmoId },
                include: {
                    requirements: {
                        orderBy: {
                            sortOrder: 'asc'
                        }
                    }
                },
                orderBy: {
                    sortOrder: 'asc'
                }
            }),
            10000 // Higher timeout for complex join
        );

        return NextResponse.json(sections);
    } catch (error) {
        console.error("Error fetching CMO checklist:", error);
        return NextResponse.json({ error: "Failed to fetch checklist items" }, { status: 500 });
    }
}
