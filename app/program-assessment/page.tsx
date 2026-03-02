import { prisma } from "@/lib/prisma";
import { AssessmentForm } from "./assessment-form";

export default async function Page() {
  // Fetch all in parallel on the server — no client round-trip needed
  const [cmos, programs, institutions] = await Promise.all([
    prisma.cmo.findMany({ orderBy: { series: "desc" } }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
    prisma.institution.findMany({ orderBy: { name: "asc" } }),
  ]);

  const cmoOptions = cmos.map((cmo) => ({
    value: cmo.id,
    label: `${cmo.number} - ${cmo.title}`,
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