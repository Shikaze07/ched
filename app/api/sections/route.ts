import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, cmoId, sectionNumber, sectionTitle, sortOrder } = body;

        if (!cmoId || !sectionNumber || !sectionTitle) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await executeQuery(async () => {
            if (id) {
                return await prisma.section.update({
                    where: { id },
                    data: {
                        sectionNumber,
                        sectionTitle,
                        sortOrder: parseInt(sortOrder?.toString() || "0"),
                    },
                });
            } else {
                return await prisma.section.create({
                    data: {
                        cmoId,
                        sectionNumber,
                        sectionTitle,
                        sortOrder: parseInt(sortOrder?.toString() || "0"),
                    },
                });
            }
        }, 8000);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error saving section:", error);
        return NextResponse.json({ error: "Failed to save section" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing section ID" }, { status: 400 });
        }

        await executeQuery(
            () => prisma.section.delete({
                where: { id },
            }),
            5000
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting section:", error);
        return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
    }
}
