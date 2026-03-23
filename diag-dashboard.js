
import { prisma } from "./lib/prisma.js";

async function diag() {
  console.log("Checking EvaluationRecord...");
  try {
    const evals = await prisma.evaluationRecord.findMany({ take: 1 });
    console.log("EvaluationRecord: OK");
  } catch (e) {
    console.error("EvaluationRecord: FAILED", e.message);
  }

  console.log("Checking CMO...");
  try {
    const cmos = await prisma.cmo.findMany({ take: 1 });
    console.log("CMO: OK");
  } catch (e) {
    console.error("CMO: FAILED", e.message);
  }

  console.log("Checking Program...");
  try {
    const progs = await prisma.program.findMany({ take: 1 });
    console.log("Program: OK");
  } catch (e) {
    console.error("Program: FAILED", e.message);
  }

  console.log("Checking Institution...");
  try {
    const insts = await prisma.institution.findMany({ take: 1 });
    console.log("Institution: OK");
  } catch (e) {
    console.error("Institution: FAILED", e.message);
  }

  console.log("Checking ArchivedEvaluationRecord...");
  try {
    const arch = await prisma.archivedEvaluationRecord.count();
    console.log("ArchivedEvaluationRecord: OK");
  } catch (e) {
    console.error("ArchivedEvaluationRecord: FAILED", e.message);
  }

  await prisma.$disconnect();
}

diag();
