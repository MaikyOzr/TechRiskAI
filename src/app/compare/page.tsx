'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Minus,
    CheckCircle2,
    AlertTriangle,
    Zap,
    LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AnalysisReport } from '@/lib/types';
import { secureStorage } from '@/lib/storage';

function CompareView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const idA = searchParams.get('idA');
    const idB = searchParams.get('idB');

    const [reportA, setReportA] = useState<any>(null);
    const [reportB, setReportB] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReports = async () => {
            if (typeof window !== 'undefined' && idA && idB) {
                const history = (await secureStorage.getItem<Record<string, any>>('techrisk_history')) || {};
                setReportA(history[idA]);
                setReportB(history[idB]);
                setLoading(false);
            }
        };
        loadReports();
    }, [idA, idB]);

    if (loading || !reportA || !reportB) {
        return <div className="p-20 text-center">Loading comparison...</div>;
    }

    const dataA = reportA.data as AnalysisReport;
    const dataB = reportB.data as AnalysisReport;

    const calculateDelta = (scoreA: number, scoreB: number) => {
        const delta = scoreB - scoreA;
        return {
            value: delta > 0 ? `+${delta}` : delta.toString(),
            trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
            color: delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'
        };
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    // Find fixed and new risks
    const risksA = dataA.riskReport.map(r => r.description);
    const risksB = dataB.riskReport.map(r => r.description);

    const fixedRisks = dataA.riskReport.filter(r => !risksB.includes(r.description));
    const newRisks = dataB.riskReport.filter(r => !risksA.includes(r.description));

    return (
        <div className="container mx-auto max-w-6xl p-4 py-8 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold font-headline">Report Comparison</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-muted/50 bg-muted/5">
                    <CardHeader>
                        <CardDescription>Baseline Report</CardDescription>
                        <CardTitle>{reportA.projectName || 'Default Project'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(reportA.timestamp).toLocaleDateString()}</p>
                    </CardHeader>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardDescription>Target Report</CardDescription>
                        <CardTitle>{reportB.projectName || 'Default Project'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(reportB.timestamp).toLocaleDateString()}</p>
                    </CardHeader>
                </Card>
            </div>

            {/* Health Delta Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <Zap className="text-yellow-500 h-5 w-5" />
                    Health Score Delta
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(dataA.riskScores || {}).map((key) => {
                        const delta = calculateDelta((dataA.riskScores as any)[key], (dataB.riskScores as any)[key]);
                        return (
                            <Card key={key} className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{key}</span>
                                <div className={`text-2xl font-bold flex items-center gap-1 ${delta.color}`}>
                                    {delta.value}% {getTrendIcon(delta.trend)}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <Separator />

            {/* Risks Changes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                        Fixed Risks ({fixedRisks.length})
                    </h2>
                    <div className="space-y-3">
                        {fixedRisks.length > 0 ? fixedRisks.map((risk, i) => (
                            <div key={i} className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-sm">
                                <p className="font-medium text-green-200">{risk.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Status: Resolved during technical remediation.</p>
                            </div>
                        )) : <p className="text-muted-foreground italic text-sm">No risks resolved between these versions.</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-headline flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        New Risks ({newRisks.length})
                    </h2>
                    <div className="space-y-3">
                        {newRisks.length > 0 ? newRisks.map((risk, i) => (
                            <div key={i} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm">
                                <p className="font-medium text-destructive">{risk.description}</p>
                                <Badge variant="destructive" className="mt-2 text-[10px] uppercase">{risk.severity}</Badge>
                            </div>
                        )) : <p className="text-muted-foreground italic text-sm">No new risks identified.</p>}
                    </div>
                </div>
            </div>

            <Separator />

            {/* Progress Narrative */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                        Executive Progress Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
                        <p>
                            This comparison shows a <strong>{calculateDelta(
                                Object.values(dataA.riskScores || {}).reduce((a, b) => a + b, 0) / 4,
                                Object.values(dataB.riskScores || {}).reduce((a, b) => a + b, 0) / 4
                            ).value}%</strong> change in overall system health.
                            {fixedRisks.length > 0 && ` The technical team has successfully mitigated ${fixedRisks.length} critical vulnerabilities.`}
                            {newRisks.length > 0 && ` However, ${newRisks.length} new concerns have surfaced in the latest architecture review, requiring prompt attention.`}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompareView />
        </Suspense>
    );
}
