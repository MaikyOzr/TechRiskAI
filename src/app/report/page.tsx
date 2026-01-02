'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  AlertTriangle,
  FileWarning,
  Loader2,
  Calendar,
  CheckCircle2,
  Check,
  MessageSquare,
  LayoutGrid,
  BotMessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';

import type { AnalysisReport, RiskReportItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  EffortBadge,
  SeverityBadge,
  ShareButton,
  BenefitItem,
} from '@/components/report-ui';
import { RiskRadarChart } from '@/components/risk-radar-chart';
import { FinancialImpactCard } from '@/components/financial-impact-card';
import { ArchitectureGraph } from '@/components/architecture-graph';
import { StrategyConsultant } from '@/components/strategy-consultant';
import { secureStorage } from '@/lib/storage';

function ReportView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [reportData, setReportData] = useState<{
    data: AnalysisReport;
    timestamp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState<Record<number, boolean>>({});
  const [consultingRiskIndex, setConsultingRiskIndex] = useState<number | null>(null);
  const [isStakeholderMode, setIsStakeholderMode] = useState(false);

  const [remediationRiskIndex, setRemediationRiskIndex] = useState<number | null>(null);
  const [remediationData, setRemediationData] = useState<any>(null);
  const [isRemediating, setIsRemediating] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (typeof window !== 'undefined' && id) {
        try {
          const history = (await secureStorage.getItem<Record<string, any>>('techrisk_history')) || {};
          const savedReport = history[id];
          if (savedReport) {
            setReportData(savedReport);

            // Load action plan state
            const plans = (await secureStorage.getItem<Record<string, any>>('techrisk_plans')) || {};
            if (plans[id]) {
              setActionPlan(plans[id]);
            }
          }
        } catch (error) {
          console.error('Failed to read from secureStorage', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const handleGenerateFix = async (index: number) => {
    if (!id || !reportData || isRemediating) return;

    setRemediationRiskIndex(index);
    setIsRemediating(true);
    setRemediationData(null);

    try {
      const risk = reportData.data.riskReport[index];
      const response = await (window as any).electronAPI.generateFix({
        riskDescription: risk.description,
        recommendation: risk.recommendation,
        technicalContext: reportData.data.technicalContext || '',
      });

      if (response.success) {
        setRemediationData(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error("Failed to generate fix:", error);
      alert("Remediation error: " + error.message);
      setRemediationRiskIndex(null);
    } finally {
      setIsRemediating(false);
    }
  };

  const toggleActionItem = async (index: number) => {
    const newPlan = { ...actionPlan, [index]: !actionPlan[index] };
    setActionPlan(newPlan);

    // Persist
    if (id) {
      const plans = (await secureStorage.getItem<Record<string, any>>('techrisk_plans')) || {};
      plans[id] = newPlan;
      await secureStorage.setItem('techrisk_plans', plans);
    }
  };

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
        <p>The requested analysis report could not be found or is invalid.</p>
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-primary/10 text-primary"
            title="Go Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
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
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isStakeholderMode ? "default" : "outline"}
            onClick={() => setIsStakeholderMode(!isStakeholderMode)}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            {isStakeholderMode ? "Engineering View" : "Stakeholder View"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (typeof window !== 'undefined' && (window as any).electronAPI) {
                const filename = `TechRisk_Report_${id}_${Date.now()}.pdf`;
                await (window as any).electronAPI.savePDF(filename);
              }
            }}
            className="hidden sm:flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <ShareButton />
        </div>
      </div>

      {reportData && (
        <div className="rounded-xl border bg-primary/5 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">Mitigation Action Plan</h3>
              <p className="text-sm text-muted-foreground">Track your progress in resolving technical risks.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-medium uppercase text-muted-foreground tracking-widest">Progress</p>
                <p className="text-2xl font-bold font-headline">
                  {Object.values(actionPlan).filter(v => v).length} / {report.riskReport.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-500"
                  style={{
                    height: `${(Object.values(actionPlan).filter(v => v).length / report.riskReport.length) * 100}%`
                  }}
                />
                <CheckCircle2 className={`h-6 w-6 transition-colors ${Object.values(actionPlan).filter(v => v).length === report.riskReport.length ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {report.financialImpact && (
        <FinancialImpactCard impact={report.financialImpact} />
      )}

      <div className="grid gap-6 md:grid-cols-12">
        <Card className={`shadow-lg ${report.riskScores ? 'md:col-span-8' : 'md:col-span-12'}`}>
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

        {report.riskScores && (
          <Card className="shadow-lg md:col-span-4 bg-primary/5 border-primary/20">
            <RiskRadarChart scores={report.riskScores} />
          </Card>
        )}
      </div>

      {!isStakeholderMode && report.architectureCode && (
        <ArchitectureGraph code={report.architectureCode} />
      )}

      {!isStakeholderMode && (
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
                <RiskItemCard
                  key={index}
                  risk={risk}
                  index={index}
                  isResolved={!!actionPlan[index]}
                  onToggleResolve={() => toggleActionItem(index)}
                  onConsult={() => setConsultingRiskIndex(index)}
                  onGenerateFix={() => handleGenerateFix(index)}
                />
              ))}
            </Accordion>
          ) : (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <CardTitle className="font-headline">No Risks Identified</CardTitle>
              <CardDescription className="mt-2">The AI analysis did not find any significant risks in the provided context.</CardDescription>
            </Card>
          )}
        </section>
      )}

      {isStakeholderMode && (
        <Card className="border-primary/20 bg-primary/5 p-8 text-center space-y-4">
          <CardHeader>
            <BotMessageSquare className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-2xl font-headline">Stakeholder View Active</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Technical details like mermaid diagrams and code evidence have been hidden to focus on business impact and high-level strategy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setIsStakeholderMode(false)}>
              Switch to Engineering View
            </Button>
          </CardContent>
        </Card>
      )}

      {consultingRiskIndex !== null && (
        <StrategyConsultant
          isOpen={consultingRiskIndex !== null}
          onOpenChange={(open) => !open && setConsultingRiskIndex(null)}
          risk={report.riskReport[consultingRiskIndex]}
          technicalContext={report.technicalContext || ''}
        />
      )}

      <CodeRemediationModal
        isOpen={remediationRiskIndex !== null}
        onOpenChange={(open) => !open && setRemediationRiskIndex(null)}
        isLoading={isRemediating}
        data={remediationData}
        riskTitle={remediationRiskIndex !== null ? report.riskReport[remediationRiskIndex].description : ''}
      />
    </div>
  );
}


function RiskItemCard({
  risk,
  index,
  isResolved,
  onToggleResolve,
  onConsult,
  onGenerateFix,
}: {
  risk: RiskReportItem;
  index: number;
  isResolved: boolean;
  onToggleResolve: () => void;
  onConsult: () => void;
  onGenerateFix: () => void;
}) {
  return (
    <AccordionItem
      value={`risk-${index}`}
      className={`mb-4 rounded-lg border transition-all duration-300 ${isResolved ? 'bg-muted/30 border-green-500/30' : 'bg-card'}`}
    >
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex w-full items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3 flex-1">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleResolve();
              }}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${isResolved ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30 hover:border-primary'}`}
            >
              {isResolved && <Check className="h-4 w-4" />}
            </div>
            <h3 className={`flex-1 text-base font-medium transition-all ${isResolved ? 'text-muted-foreground line-through' : ''}`}>
              {risk.description}
            </h3>
          </div>
          <SeverityBadge severity={risk.severity} />
          {risk.complianceMapping && (
            <div className="flex flex-wrap gap-1">
              {risk.complianceMapping.soc2 && (
                <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-400 bg-blue-500/5 px-1.5 py-0 h-5">SOC2</Badge>
              )}
              {risk.complianceMapping.iso27001 && (
                <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400 bg-purple-500/5 px-1.5 py-0 h-5">ISO27001</Badge>
              )}
              {risk.complianceMapping.gdpr && (
                <Badge variant="outline" className="text-[10px] border-orange-500/50 text-orange-400 bg-orange-500/5 px-1.5 py-0 h-5">GDPR</Badge>
              )}
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <Separator className="mb-4" />
        <div className="space-y-6">
          <div className={`${isResolved ? 'opacity-50' : ''}`}>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground/70">Evidence</h4>
            <pre className="mt-2 w-full rounded-md bg-muted p-4 text-sm text-muted-foreground whitespace-pre-wrap break-all border border-muted-foreground/10">
              <code>{risk.evidence}</code>
            </pre>
          </div>

          <div className={`${isResolved ? 'opacity-50' : ''}`}>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground/70">Business Impact</h4>
            <p className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-wrap">{risk.businessImpact}</p>
          </div>

          {risk.complianceMapping && (Object.values(risk.complianceMapping).some(v => v)) && (
            <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 bg-muted/5">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Compliance Mapping
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {risk.complianceMapping.soc2 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">SOC2 Control</p>
                    <p className="text-xs text-muted-foreground">{risk.complianceMapping.soc2}</p>
                  </div>
                )}
                {risk.complianceMapping.iso27001 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">ISO27001 Detail</p>
                    <p className="text-xs text-muted-foreground">{risk.complianceMapping.iso27001}</p>
                  </div>
                )}
                {risk.complianceMapping.gdpr && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">GDPR Article</p>
                    <p className="text-xs text-muted-foreground">{risk.complianceMapping.gdpr}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-md border border-primary/20 bg-primary/5 p-4 relative group">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary/70">Recommendation</h4>
            <p className="mt-2 text-foreground leading-relaxed whitespace-pre-wrap">{risk.recommendation}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <EffortBadge effort={risk.effort} />
                <BenefitItem benefit={risk.benefit} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateFix();
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Fix
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConsult();
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask Strategy Assistant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CodeRemediationModal({
  isOpen,
  onOpenChange,
  data,
  isLoading,
  riskTitle,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  isLoading: boolean;
  riskTitle: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>AI Code Remediation</DialogTitle>
          </div>
          <DialogDescription className="mt-1">
            Suggested fix for: <span className="font-medium text-foreground">{riskTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-0 space-y-6 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse">Generating secure remediation code...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-primary/5 p-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Technical Explanation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.explanation}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suggested Fix ({data.language})</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(data.fixCode);
                      // Optional: Toast or feedback
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
                <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <span className="leading-relaxed">
                      <strong>Disclaimer:</strong> This code is generated as a <strong>suggestion and idea</strong> for fixing the issue, not a complete production-ready solution.
                      Please review, test, and adapt it to your specific product context before implementation.
                    </span>
                  </p>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 font-mono text-xs overflow-x-auto border border-slate-800 break-all whitespace-pre-wrap">
                  <code>{data.fixCode}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 text-muted-foreground italic">
              Failed to load remediation data. Please try again.
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-muted/20">
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close Remediation</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportView />
    </Suspense>
  )
}
