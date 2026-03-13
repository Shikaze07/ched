import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const institutions = await executeQuery(
            () => prisma.institution.findMany({ orderBy: { name: "asc" } }),
            25000
        );
        return NextResponse.json(institutions);
    } catch (error) {
        console.error("Error fetching institutions:", error);
        return NextResponse.json({ error: "Failed to fetch institutions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const result = await executeQuery(async () => {
            if (id) {
                return await prisma.institution.update({ where: { id }, data: { name } });
            } else {
                return await prisma.institution.create({ data: { name } });
            }
        }, 25000);

        return NextResponse.json({ success: true, institution: result }, { status: id ? 200 : 201 });
    } catch (error) {
        console.error("Error saving institution:", error);
        return NextResponse.json({ error: "Failed to save institution" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing institution ID" }, { status: 400 });
        }

        await executeQuery(() => prisma.institution.delete({ where: { id } }), 25000);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting institution:", error);
        return NextResponse.json({ error: "Failed to delete institution" }, { status: 500 });
    }
}
