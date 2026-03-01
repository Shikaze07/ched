import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const cmos = await executeQuery(
            () => prisma.cmo.findMany({
                include: {
                    program: true,
                },
                orderBy: {
                    series: 'desc'
                }
            }),
            5000
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
        }, 8000);

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
            () => prisma.cmo.delete({
                where: { id },
            }),
            5000
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting CMO:", error);
        return NextResponse.json({ error: "Failed to delete CMO" }, { status: 500 });
    }
}
