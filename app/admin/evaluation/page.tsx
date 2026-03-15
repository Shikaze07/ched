import { columns } from "./columns"
import { DataTable } from "./data-table"
import { prisma } from "@/lib/prisma"

async function getData() {
    const [records, institutions, cmos, programs] = await Promise.all([
        prisma.evaluationRecord.findMany({
            orderBy: {
                timestamp: "desc",
            },
        }),
        prisma.institution.findMany(),
        prisma.cmo.findMany(),
        prisma.program.findMany(),
    ])

    const instMap = new Map(institutions.map((i) => [i.id, i.name]))
    const cmoMap = new Map(cmos.map((c) => [c.id, `${c.number} - ${c.title}`]))
    const programMap = new Map(programs.map((p) => [p.id, p.name]))

    return records.map((r) => {
        const cmoItems = (Array.isArray(r.selectedCMOs) ? r.selectedCMOs : []) as any[]
        const programItems = (Array.isArray(r.selectedPrograms) ? r.selectedPrograms : []) as any[]

        const cmoNames = cmoItems
            .map((item: any) => {
                if (typeof item === "string") return cmoMap.get(item) || item
                if (item && typeof item === "object") {
                    const id = item.value ?? item.id
                    if (id) return cmoMap.get(id) || item.label || item.title || id
                    return item.label || item.title || JSON.stringify(item)
                }
                return String(item)
            })
            .filter(Boolean)
            .join(", ")

        const programNames = programItems
            .map((item: any) => {
                if (typeof item === "string") return programMap.get(item) || item
                if (item && typeof item === "object") {
                    const id = item.value ?? item.id
                    if (id) return programMap.get(id) || item.label || item.name || id
                    return item.label || item.name || JSON.stringify(item)
                }
                return String(item)
            })
            .filter(Boolean)
            .join(", ")

        return {
            ...r,
            institutionName: instMap.get(r.institution) || r.institution,
            cmo: cmoNames,
            program: programNames,
        }
    })
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