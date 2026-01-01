'use client';

import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    PolarRadiusAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface RiskRadarChartProps {
    scores: {
        security: number;
        scalability: number;
        stability: number;
        cost: number;
        architecture: number;
    };
}

export function RiskRadarChart({ scores }: RiskRadarChartProps) {
    const data = [
        { subject: 'Security', A: scores.security, fullMark: 100 },
        { subject: 'Scalability', A: scores.scalability, fullMark: 100 },
        { subject: 'Stability', A: scores.stability, fullMark: 100 },
        { subject: 'Cost', A: scores.cost, fullMark: 100 },
        { subject: 'Architecture', A: scores.architecture, fullMark: 100 },
    ];

    return (
        <Card className="h-full border-none bg-transparent shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Tech Health Radar</CardTitle>
                <CardDescription>
                    Higher values represent better health and lower risk.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
                <div className="h-[300px] w-full max-w-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="Risk Scores"
                                dataKey="A"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
