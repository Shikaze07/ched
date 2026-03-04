import { columns } from "./columns"
import { DataTable } from "./data-table"
import { prisma } from "@/lib/prisma"

async function getData() {
    return await prisma.evaluationRecord.findMany({
        orderBy: {
            timestamp: "desc",
        },
    })
}

export default async function EvaluationPage() {
    const data = await getData()

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold mb-6">Evaluations</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}