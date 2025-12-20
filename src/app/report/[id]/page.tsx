'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  AlertTriangle,
  FileWarning,
  Loader2,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

import type { AnalysisReport, RiskReportItem } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  EffortBadge,
  SeverityBadge,
  ShareButton,
  BenefitItem,
} from '@/components/report-ui';

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [reportData, setReportData] = useState<{
    data: AnalysisReport;
    timestamp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const history = JSON.parse(
          localStorage.getItem('techrisk_history') || '{}'
        );
        const savedReport = history[id];
        if (savedReport) {
          setReportData(savedReport);
        }
      } catch (error) {
        console.error('Failed to read from localStorage', error);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg">Loading Analysis Report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-destructive">
        <FileWarning className="h-12 w-12" />
        <h1 className="text-2xl font-bold font-headline">Report Not Found</h1>
        <p>The requested analysis report could not be found.</p>
        <Button asChild>
          <a href="/">New Analysis</a>
        </Button>
      </div>
    );
  }

  const { data: report, timestamp } = reportData;

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-4 py-8 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Analysis Report
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Generated on {format(new Date(timestamp), 'MMMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>
        <ShareButton />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <FileText />
            Executive Summary
          </CardTitle>
          <CardDescription>
            A non-technical overview of the findings for stakeholders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {report.executiveSummary}
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-headline text-2xl font-bold">
          <AlertTriangle />
          Structured Risk Report
        </h2>
        {report.riskReport.length > 0 ? (
          <Accordion
            type="multiple"
            defaultValue={['risk-0']}
            className="w-full"
          >
            {report.riskReport.map((risk, index) => (
              <RiskItemCard key={index} risk={risk} index={index} />
            ))}
          </Accordion>
        ) : (
           <Card className="flex flex-col items-center justify-center p-10 text-center">
             <CardTitle className="font-headline">No Risks Identified</CardTitle>
             <CardDescription className="mt-2">The AI analysis did not find any significant risks in the provided context.</CardDescription>
           </Card>
        )}
      </section>
    </div>
  );
}

function RiskItemCard({
  risk,
  index,
}: {
  risk: RiskReportItem;
  index: number;
}) {
  return (
    <AccordionItem
      value={`risk-${index}`}
      className="mb-4 rounded-lg border bg-card shadow-sm"
    >
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex w-full items-center justify-between gap-4 text-left">
          <h3 className="flex-1 text-base font-medium">{risk.description}</h3>
          <SeverityBadge severity={risk.severity} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <Separator className="mb-4" />
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold">Evidence</h4>
            <pre className="mt-2 w-full rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <code>{risk.evidence}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-semibold">Business Impact</h4>
            <p className="mt-2 text-muted-foreground">{risk.businessImpact}</p>
          </div>

          <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
            <h4 className="font-semibold">Recommendation</h4>
            <p className="mt-2 text-foreground">{risk.recommendation}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <EffortBadge effort={risk.effort} />
              <BenefitItem benefit={risk.benefit} />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
