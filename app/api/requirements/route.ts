import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, cmoId, sectionId, description, requiredEvidence, sortOrder } = body;

        if (!cmoId || !sectionId || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await executeQuery(async () => {
            if (id) {
                return await prisma.requirement.update({
                    where: { id },
                    data: {
                        description,
                        requiredEvidence: requiredEvidence || "N/A",
                        sortOrder: parseInt(sortOrder?.toString() || "0"),
                    },
                });
            } else {
                return await prisma.requirement.create({
                    data: {
                        cmoId,
                        sectionId,
                        description,
                        requiredEvidence: requiredEvidence || "N/A",
                        sortOrder: parseInt(sortOrder?.toString() || "0"),
                    },
                });
            }
        }, 25000);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving requirement:", error);
        return NextResponse.json({ error: "Failed to save requirement" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing requirement ID" }, { status: 400 });
        }

        await executeQuery(
            () => prisma.requirement.delete({
                where: { id },
            }),
            25000
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting requirement:", error);
        return NextResponse.json({ error: "Failed to delete requirement" }, { status: 500 });
    }
}
