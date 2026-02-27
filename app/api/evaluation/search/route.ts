import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
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

    const records = await executeQuery(
      () =>
        prisma.evaluationRecord.findMany({
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
        }),
      8000 // 8 second timeout
    );

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error searching evaluation records:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Search timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to search evaluation records" },
      { status: 500 }
    );
  }
}
