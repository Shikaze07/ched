
import { prisma } from "./lib/prisma.js";

async function checkColumns() {
  try {
    console.log("--- EvaluationRecord Columns ---");
    const evalCols = await prisma.$queryRaw`SHOW COLUMNS FROM EvaluationRecord`;
    console.log(JSON.stringify(evalCols, null, 2));

    console.log("\n--- ArchivedEvaluationRecord Columns ---");
    const archCols = await prisma.$queryRaw`SHOW COLUMNS FROM ArchivedEvaluationRecord`;
    console.log(JSON.stringify(archCols, null, 2));

  } catch (e) {
    console.error("Error checking columns:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
