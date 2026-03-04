import { columns } from "./columns"
import { DataTable } from "./data-table"
import { prisma } from "@/lib/prisma"

async function getData() {
    const [records, institutions] = await Promise.all([
        prisma.evaluationRecord.findMany({
            orderBy: {
                timestamp: "desc",
            },
        }),
        prisma.institution.findMany(),
    ])

    const instMap = new Map(institutions.map((i) => [i.id, i.name]))

    return records.map((r) => ({
        ...r,
        institutionName: instMap.get(r.institution) || r.institution,
    }))
}

export type EvaluationWithInstitution = Awaited<ReturnType<typeof getData>>[number]

export default async function EvaluationPage() {
    const data = await getData()

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold mb-6">Evaluations</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}