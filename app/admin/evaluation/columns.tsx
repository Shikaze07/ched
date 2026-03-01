"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { EvaluationRecord } from "@prisma/client"

export const columns: ColumnDef<EvaluationRecord>[] = [
    {
        accessorKey: "refNo",
        header: "Ref No",
    },
    {
        accessorKey: "institution",
        header: "Institution",
    },
    {
        accessorKey: "personnelName",
        header: "Personnel Name",
    },
    {
        accessorKey: "timestamp",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("timestamp"))
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const evaluation = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(evaluation.refNo)}
                        >
                            Copy Ref No
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/evaluation/${evaluation.refNo}`} className="flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Select Evaluation
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]