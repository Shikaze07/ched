import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import pusher from "@/lib/pusher-server";
import { NextRequest, NextResponse } from "next/server";

// Helper function to batch create responses to avoid connection flooding
async function createResponsesInBatches(
  responses: Record<string, any>,
  evaluationId: string,
  batchSize: number = 2
) {
  const entries = Object.entries(responses);
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const promises = batch.map(([requirementId, response]: [string, any]) =>
      prisma.evaluationResponse.create({
        data: {
          requirementId: requirementId,
          evaluationId: evaluationId,
          actualSituation: response.actual_situation || "",
          googleLink: response.google_link || "",
          heiCompliance: response.hei_compliance || "",
          chedCompliance: response.ched_compliance || "",
          linkAccessible: response.link_accessible || "",
          chedRemarks: response.ched_remarks || "",
        },
      })
    );
    await Promise.all(promises);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refNo, responses, publishUpdate } = body;

    if (!refNo) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    // Get the evaluation record
    const evaluationRecord = await executeQuery(
      () =>
        prisma.evaluationRecord.findUnique({
          where: { refNo },
        }),
      5000
    );

    if (!evaluationRecord) {
      return NextResponse.json(
        { error: "Evaluation record not found" },
        { status: 404 }
      );
    }

    // Delete and create in a transaction if responses exist
    if (responses && Object.keys(responses).length > 0) {
      await executeQuery(async () => {
        // Delete existing responses
        await prisma.evaluationResponse.deleteMany({
          where: {
            evaluationId: evaluationRecord.id,
          },
        });

        // Create new responses in batches to avoid overwhelming connection pool
        await createResponsesInBatches(
          responses,
          evaluationRecord.id
        );
      }, 8000);
    }

    // Publish update to Pusher if requested
    if (publishUpdate) {
      try {
        await pusher.trigger(`evaluation-${refNo}`, "response-updated", responses);
      } catch (error) {
        console.error("Error publishing to Pusher:", error);
        // Don't fail the request if Pusher fails
      }
    }

    return NextResponse.json(
      { success: true, message: "Evaluation responses saved" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving evaluation responses:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Save operation timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save evaluation responses" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refNo = searchParams.get("refNo");

    if (!refNo) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    // Get evaluation record and responses in parallel
    const evaluationRecord = await executeQuery(
      () =>
        prisma.evaluationRecord.findUnique({
          where: { refNo },
        }),
      5000
    );

    if (!evaluationRecord) {
      return NextResponse.json(
        { error: "Evaluation record not found" },
        { status: 404 }
      );
    }

    // Get all evaluation responses for this evaluation
    const responses = await executeQuery(
      () =>
        prisma.evaluationResponse.findMany({
          where: {
            evaluationId: evaluationRecord.id,
          },
        }),
      5000
    );

    // Convert to the format expected by the frontend
    const responseMap: Record<string, any> = {};
    responses.forEach((response) => {
      responseMap[response.requirementId] = {
        requirement_id: response.requirementId,
        actual_situation: response.actualSituation,
        google_link: response.googleLink,
        hei_compliance: response.heiCompliance,
        ched_compliance: response.chedCompliance,
        link_accessible: response.linkAccessible,
        ched_remarks: response.chedRemarks,
      };
    });

    return NextResponse.json(responseMap);
  } catch (error) {
    console.error("Error fetching evaluation responses:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Fetch operation timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch evaluation responses" },
      { status: 500 }
    );
  }
}
