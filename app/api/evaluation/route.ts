import { prisma } from "@/lib/prisma";
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

    // Check if record already exists
    const existingRecord = await prisma.evaluationRecord.findUnique({
      where: { refNo },
    });

    if (existingRecord) {
      // Update existing record
      const updated = await prisma.evaluationRecord.update({
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
      return NextResponse.json(
        { success: true, record: updated },
        { status: 200 }
      );
    }

    // Create new record
    const newRecord = await prisma.evaluationRecord.create({
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

    return NextResponse.json(
      { success: true, record: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving evaluation record:", error);
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
      const record = await prisma.evaluationRecord.findUnique({
        where: { refNo },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(record);
    }

    // Get all records
    const records = await prisma.evaluationRecord.findMany();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching evaluation records:", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluation records" },
      { status: 500 }
    );
  }
}
