import { prisma } from "@/lib/prisma";
import pusher from "@/lib/pusher-server";
import { NextRequest, NextResponse } from "next/server";

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
    const evaluationRecord = await prisma.evaluationRecord.findUnique({
      where: { refNo },
    });

    if (!evaluationRecord) {
      return NextResponse.json(
        { error: "Evaluation record not found" },
        { status: 404 }
      );
    }

    // Delete existing responses for this evaluation
    await prisma.evaluationResponse.deleteMany({
      where: {
        evaluationId: evaluationRecord.id,
      },
    });

    // Save new responses
    if (responses && Object.keys(responses).length > 0) {
      const responsePromises = Object.entries(responses).map(
        ([requirementId, response]: [string, any]) => {
          return prisma.evaluationResponse.create({
            data: {
              requirementId: requirementId,
              evaluationId: evaluationRecord.id,
              actualSituation: response.actual_situation || "",
              googleLink: response.google_link || "",
              heiCompliance: response.hei_compliance || "",
              chedCompliance: response.ched_compliance || "",
              linkAccessible: response.link_accessible || "",
              chedRemarks: response.ched_remarks || "",
            },
          });
        }
      );

      await Promise.all(responsePromises);
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

    // Get the evaluation record
    const evaluationRecord = await prisma.evaluationRecord.findUnique({
      where: { refNo },
    });

    if (!evaluationRecord) {
      return NextResponse.json(
        { error: "Evaluation record not found" },
        { status: 404 }
      );
    }

    // Get all evaluation responses for this evaluation
    const responses = await prisma.evaluationResponse.findMany({
      where: {
        evaluationId: evaluationRecord.id,
      },
    });

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
    return NextResponse.json(
      { error: "Failed to fetch evaluation responses" },
      { status: 500 }
    );
  }
}
