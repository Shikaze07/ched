"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Cmo } from "@prisma/client"

export type CmoColumnProps = {
    onEdit: (cmo: Cmo) => void
    onDelete: (id: string) => void
}

export const getColumns = ({ onEdit, onDelete }: CmoColumnProps): ColumnDef<any>[] => [
    {
        accessorKey: "number",
        header: "CMO Number",
    },
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "series",
        header: "Series",
    },
    {
        accessorKey: "program.name",
        header: "Program",
        cell: ({ row }) => {
            const program = row.original.program
            return program ? program.name : <span className="text-muted-foreground italic">No Program</span>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const cmo = row.original

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
                        <DropdownMenuItem onClick={() => onEdit(cmo)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit CMO
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(cmo.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete CMO
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
