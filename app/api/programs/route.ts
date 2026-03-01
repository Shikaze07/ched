import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const programs = await executeQuery(
            () => prisma.program.findMany({
                orderBy: {
                    name: 'asc'
                }
            }),
            5000
        );
        return NextResponse.json(programs);
    } catch (error) {
        console.error("Error fetching programs:", error);
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, code, name } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await executeQuery(async () => {
            if (id) {
                return await prisma.program.update({
                    where: { id },
                    data: { code, name }
                });
            } else {
                return await prisma.program.create({
                    data: { code, name }
                });
            }
        }, 8000);

        return NextResponse.json({ success: true, program: result });
    } catch (error) {
        console.error("Error saving program:", error);
        return NextResponse.json({ error: "Failed to save program" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing program ID" }, { status: 400 });
        }

        await executeQuery(
            () => prisma.program.delete({
                where: { id }
            }),
            5000
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting program:", error);
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
