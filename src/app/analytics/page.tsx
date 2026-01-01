'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area, BarChart, Bar
} from 'recharts';
import { format } from 'date-fns';
import {
    ArrowLeft, TrendingUp, TrendingDown, Activity,
    Shield, Zap, Rocket, Coins, Layout
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnalysisReport } from '@/lib/types';

import { secureStorage } from '@/lib/storage';

interface HistoryEntry {
    data: AnalysisReport;
    timestamp: number;
    projectName?: string;
}

function AnalyticsView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectName = searchParams.get('project');

    const [projectData, setProjectData] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            if (typeof window !== 'undefined') {
                const history = (await secureStorage.getItem<Record<string, HistoryEntry>>('techrisk_history')) || {};
                const entries = Object.values(history);

                const filtered = entries
                    .filter(e => (e.projectName || 'Default Project') === (projectName || 'Default Project'))
                    .sort((a, b) => a.timestamp - b.timestamp);

                setProjectData(filtered);
                setLoading(false);
            }
        };
        loadHistory();
    }, [projectName]);

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    const chartData = projectData.map(entry => ({
        date: format(new Date(entry.timestamp), 'MMM dd'),
        fullDate: format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm'),
        security: entry.data.riskScores?.security || 0,
        scalability: entry.data.riskScores?.scalability || 0,
        stability: entry.data.riskScores?.stability || 0,
        cost: entry.data.riskScores?.cost || 0,
        architecture: entry.data.riskScores?.architecture || 0,
        average: Math.round(
            ((entry.data.riskScores?.security || 0) +
                (entry.data.riskScores?.scalability || 0) +
                (entry.data.riskScores?.stability || 0) +
                (entry.data.riskScores?.cost || 0) +
                (entry.data.riskScores?.architecture || 0)) / 5
        )
    }));

    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const delta = previous ? latest.average - previous.average : 0;

    return (
        <div className="container mx-auto max-w-6xl p-4 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{projectName || 'General Analytics'}</h1>
                        <p className="text-muted-foreground italic">Historical Risk & Health Trends</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={delta >= 0 ? "default" : "destructive"}>
                        {delta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {delta > 0 ? `+${delta}` : delta}% Trend
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Security" value={latest?.security} icon={<Shield className="text-blue-500" />} />
                <StatCard title="Scalability" value={latest?.scalability} icon={<Rocket className="text-purple-500" />} />
                <StatCard title="Stability" value={latest?.stability} icon={<Zap className="text-amber-500" />} />
                <StatCard title="Cost" value={latest?.cost} icon={<Coins className="text-green-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Overall Health Progression
                        </CardTitle>
                        <CardDescription>Average tech health score over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area type="monotone" dataKey="average" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAvg)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layout className="h-5 w-5 text-primary" />
                            Category Breakdown
                        </CardTitle>
                        <CardDescription>Comparison of health pillars across iterations</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Legend iconType="circle" />
                                <Line type="monotone" dataKey="security" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="scalability" stroke="#a855f7" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Iteration Comparison</CardTitle>
                    <CardDescription>Raw score distribution for last 5 analyses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.slice(-5)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                            <Bar dataKey="security" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="scalability" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="stability" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
                    {icon}
                </div>
                <div className="text-3xl font-bold font-headline">{value || 0}%</div>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${value || 0}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Initializing analytics dashboard...</div>}>
            <AnalyticsView />
        </Suspense>
    );
}
