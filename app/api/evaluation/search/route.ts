import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const records = await prisma.evaluationRecord.findMany({
      where: {
        OR: [
          {
            personnelName: {
              contains: searchTerm,
            },
          },
          {
            refNo: {
              contains: searchTerm,
            },
          },
          {
            institution: {
              contains: searchTerm,
            },
          },
          {
            email: {
              contains: searchTerm,
            },
          },
        ],
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50, // Limit results for performance
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error searching evaluation records:", error);
    return NextResponse.json(
      { error: "Failed to search evaluation records" },
      { status: 500 }
    );
  }
}
