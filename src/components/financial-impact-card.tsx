'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle, TrendingDown, Hammer } from 'lucide-react';

interface FinancialImpactProps {
    impact: {
        potentialLoss: string;
        costToFix: string;
        businessUrgency: 'Critical' | 'High' | 'Medium' | 'Low';
        riskSummary: string;
    };
}

const urgencyColors = {
    Critical: 'bg-red-500 hover:bg-red-600',
    High: 'bg-orange-500 hover:bg-orange-600',
    Medium: 'bg-yellow-500 hover:bg-yellow-600',
    Low: 'bg-blue-500 hover:bg-blue-600',
};

export function FinancialImpactCard({ impact }: FinancialImpactProps) {
    return (
        <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Financial Exposure Analysis
                    </CardTitle>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Business Impact Assessment</p>
                </div>
                <Badge className={urgencyColors[impact.businessUrgency]}>
                    {impact.businessUrgency} Urgency
                </Badge>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-1">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-red-500/10 p-2">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estimated Revenue Risk</p>
                                <p className="text-2xl font-bold text-red-500">{impact.potentialLoss}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Projected loss per security incident or downtime</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-500/10 p-2">
                                <Hammer className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mitigation Cost</p>
                                <p className="text-2xl font-bold text-blue-500">{impact.costToFix}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Estimated investment required for remediation</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-lg bg-primary/5 p-5 border border-dashed border-primary/20 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                            <AlertCircle className="h-4 w-4" />
                            Executive Summary
                        </div>
                        <p className="text-base italic text-foreground leading-relaxed whitespace-pre-wrap">
                            "{impact.riskSummary}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-primary/10 flex justify-center">
                            <span className="text-[10px] text-muted-foreground font-mono tracking-widest">
                                ROI ESTIMATE: HIGH BENEFIT / LOW EFFORT MITIGATION
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
