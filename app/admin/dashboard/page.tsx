"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, BookOpen, Building2, BarChart3, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
    totalEvaluations: number
    totalCmos: number
    totalPrograms: number
    readyTemplates: number
    archivedEvaluations: number
    evaluationsByCmo: Array<{ number: string; count: number }>
    evaluationsByProgram: Array<{ name: string; count: number }>
    evaluationsByInstitution: Array<{ name: string; count: number }>
    evaluationsByYear: Array<{ year: string; count: number }>
    recentEvaluations: Array<{
        id: string
        refNo: string
        personnelName: string
        institution: string
        academicYear: string
        dateOfEvaluation: string
    }>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]

export default function DashboardPage() {
    const [stats, setStats] = React.useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch("/api/dashboard")
                if (!response.ok) throw new Error("Failed to fetch dashboard data")
                const data = await response.json()
                setStats(data)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                toast.error("Failed to load dashboard data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center mt-70">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of evaluations and templates</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Total Evaluations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.totalEvaluations || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">All evaluation records</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-amber-600" />
                            CMO Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.totalCmos || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Available templates</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Ready Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.readyTemplates || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed setup</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-600" />
                            Programs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.totalPrograms || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Academic programs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-red-600" />
                            Archived
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.archivedEvaluations || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Archived records</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evaluations by CMO */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluations by CMO</CardTitle>
                        <CardDescription>Distribution across templates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.evaluationsByCmo && stats.evaluationsByCmo.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.evaluationsByCmo}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="number"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evaluations by Program */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluations by Program</CardTitle>
                        <CardDescription>Distribution across programs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.evaluationsByProgram && stats.evaluationsByProgram.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.evaluationsByProgram}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, count }) => `${name}: ${count}`}
                                    >
                                        {stats.evaluationsByProgram.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evaluations by Institution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Institutions</CardTitle>
                        <CardDescription>Evaluations by institution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.evaluationsByInstitution && stats.evaluationsByInstitution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={stats.evaluationsByInstitution.slice(0, 10)}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evaluations by Academic Year */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluations by Year</CardTitle>
                        <CardDescription>Timeline of evaluations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.evaluationsByYear && stats.evaluationsByYear.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.evaluationsByYear}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Evaluations */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Evaluations</CardTitle>
                    <CardDescription>Latest 10 evaluation records</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats?.recentEvaluations && stats.recentEvaluations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference No</TableHead>
                                        <TableHead>Personnel</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recentEvaluations.map((evaluation) => (
                                        <TableRow key={evaluation.id}>
                                            <TableCell>
                                                <Badge variant="outline">{evaluation.refNo}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{evaluation.personnelName}</TableCell>
                                            <TableCell>{evaluation.institution}</TableCell>
                                            <TableCell>{evaluation.academicYear}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(evaluation.dateOfEvaluation).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No evaluations yet
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}