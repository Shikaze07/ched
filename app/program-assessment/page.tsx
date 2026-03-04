import { prisma } from "@/lib/prisma";
import { executeQuery } from "@/lib/db-query";
import { AssessmentForm } from "./assessment-form";

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch all in parallel on the server — no client round-trip needed
  // Use executeQuery for better resilience against connection issues in production
  const [cmos, programs, institutions] = await executeQuery(async () => {
    return await Promise.all([
      prisma.cmo.findMany({ orderBy: { series: "desc" } }),
      prisma.program.findMany({ orderBy: { name: "asc" } }),
      prisma.institution.findMany({ orderBy: { name: "asc" } }),
    ]);
  });

  const cmoOptions = cmos.map((cmo) => ({
    value: cmo.id,
    label: cmo.title,
  }));

  const programOptions = programs.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const institutionOptions = institutions.map((inst) => ({
    value: inst.id,
    label: inst.name,
  }));

  const cmoProgramMap: Record<string, string | null> = {};
  cmos.forEach((cmo) => {
    cmoProgramMap[cmo.id] = cmo.programId ?? null;
  });

  return (
    <AssessmentForm
      cmoOptions={cmoOptions}
      programOptions={programOptions}
      institutionOptions={institutionOptions}
      cmoProgramMap={cmoProgramMap}
    />
  );
}