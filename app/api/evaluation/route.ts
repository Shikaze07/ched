import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      personnelName,
      position,
      email,
      institution,
      academicYear,
      selectedCMOs,
      selectedPrograms,
      refNo,
      orNumber,
      dateOfEvaluation,
    } = body;

    // Validate required fields
    if (
      !personnelName ||
      !position ||
      !email ||
      !institution ||
      !academicYear ||
      !refNo
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await executeQuery(async () => {
      // Check if record already exists
      const existingRecord = await prisma.evaluationRecord.findUnique({
        where: { refNo },
      });

      if (existingRecord) {
        // Update existing record
        return await prisma.evaluationRecord.update({
          where: { refNo },
          data: {
            personnelName,
            position,
            email,
            institution,
            academicYear,
            selectedCMOs: selectedCMOs || [],
            selectedPrograms: selectedPrograms || [],
            orNumber: orNumber || "",
            dateOfEvaluation: dateOfEvaluation
              ? new Date(dateOfEvaluation)
              : new Date(),
          },
        });
      }

      // Create new record
      return await prisma.evaluationRecord.create({
        data: {
          personnelName,
          position,
          email,
          institution,
          academicYear,
          selectedCMOs: selectedCMOs || [],
          selectedPrograms: selectedPrograms || [],
          refNo,
          orNumber: orNumber || "",
          dateOfEvaluation: dateOfEvaluation
            ? new Date(dateOfEvaluation)
            : new Date(),
        },
      });
    }, 8000);

    return NextResponse.json(
      { success: true, record: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving evaluation record:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Save operation timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save evaluation record" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refNo = searchParams.get("refNo");

    if (refNo) {
      const record = await executeQuery(
        () =>
          prisma.evaluationRecord.findUnique({
            where: { refNo },
          }),
        5000
      );

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(record);
    }

    // Get all records
    const records = await executeQuery(
      () => prisma.evaluationRecord.findMany(),
      5000
    );
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching evaluation records:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Fetch operation timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch evaluation records" },
      { status: 500 }
    );
  }
}
