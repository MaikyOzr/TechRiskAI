'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BotMessageSquare, Lock, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { LoadingAnalysis } from '@/components/loading-analysis';
import { analyzeAction } from './actions';
import type { PerformAIRiskAnalysisOutput } from '@/ai/flows/perform-ai-risk-analysis';
import { checkAccess, AccessStatus } from '@/lib/access';
import { PricingDialog } from '@/components/pricing-dialog';
import { secureStorage } from '@/lib/storage';
import { sanitizeInput, hasSensitiveData } from '@/lib/sanitizer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// ... (rest of imports)

function URLImportDialog({
  isOpen,
  onOpenChange,
  onImport,
  isLoading
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (url: string) => void;
  isLoading: boolean;
}) {
  const [url, setUrl] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load from URL</DialogTitle>
          <DialogDescription>
            Enter a direct file URL or a GitHub link. We'll fetch the content and add it to your analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">File URL</Label>
            <Input
              id="url"
              placeholder="https://github.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url && !isLoading) {
                  onImport(url);
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onImport(url)}
            disabled={!url || isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Import Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Extend the window interface to include the electronAPI
declare global {
  interface Window {
    electronAPI?: {
      performAnalysis: (args: {
        technicalContext: string;
      }) => Promise<{ success: boolean; data?: PerformAIRiskAnalysisOutput; error?: string }>;
    };
  }
}

function SubmitButton({ isPending, hasAccess }: { isPending: boolean; hasAccess: boolean }) {
  return (
    <Button type="submit" disabled={isPending || !hasAccess} size="lg" className="w-full">
      {isPending ? 'Analyzing...' : 'Generate Report'}
    </Button>
  );
}

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [access, setAccess] = useState<AccessStatus>({
    hasAccess: false,
    isTrial: false,
    trialRemainingHours: 0,
  });

  const updateAccess = async () => {
    const status = await checkAccess();
    setAccess(status);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const { markAsPaid } = require('@/lib/access');
      markAsPaid().then(() => updateAccess());
      router.replace('/');
    } else {
      updateAccess();
    }
  }, [router]);

  const handleAnalysisResult = async (result: PerformAIRiskAnalysisOutput, projectName?: string) => {
    if (!result || !result.riskReport || !result.executiveSummary) {
      throw new Error('Invalid response from AI model.');
    }

    const id = Date.now().toString();
    const history = (await secureStorage.getItem<Record<string, any>>('techrisk_history')) || {};
    history[id] = {
      projectName: projectName || 'Untitled Project',
      data: result,
      timestamp: Date.now(),
    };
    await secureStorage.setItem('techrisk_history', history);
    router.push(`/report?id=${id}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!access.hasAccess) {
      setIsPricingOpen(true);
      return;
    }

    setError(null);
    const formData = new FormData(event.currentTarget);
    const rawContext = formData.get('technicalContext') as string;
    const projectName = formData.get('projectName') as string;

    // Internal Hardening: Sanitize input before AI processing
    const { sanitized, maskedCount } = sanitizeInput(rawContext);
    if (maskedCount > 0) {
      console.log(`[Security] Masked ${maskedCount} sensitive patterns in input.`);
    }

    if (!rawContext || rawContext.trim().length < 50) {
      setError(
        'Please provide sufficient technical context (at least 50 characters).'
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await analyzeAction({ technicalContext: sanitized, projectName });
        handleAnalysisResult(result, projectName);
      } catch (e: any) {
        console.error(e);
        setError(
          e.message ||
          'An error occurred during analysis. The AI model may be unavailable. Please try again later.'
        );
      }
    });
  };

  const handleFiles = async (files: File[]) => {
    let combinedContent = '';
    for (const file of files) {
      try {
        const text = await file.text();
        combinedContent += `\n/* --- FILE: ${file.name} --- */\n${text}\n`;
      } catch (err) {
        console.error(`Failed to read file ${file.name}`, err);
      }
    }

    if (!combinedContent) return;

    const textarea = document.querySelector('textarea[name="technicalContext"]') as HTMLTextAreaElement;
    if (textarea) {
      const currentVal = textarea.value;
      textarea.value = (currentVal ? currentVal + '\n' : '') + combinedContent;
      // Manually trigger change for any listeners
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
  };

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);

  if (isPending) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl relative overflow-hidden">
        {!access.hasAccess && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Access Restricted</h2>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Please upgrade to Pro or enter a promo code to start your technical risk analysis.
            </p>
            <Button size="lg" onClick={() => setIsPricingOpen(true)}>
              View Pricing & Trial Options
            </Button>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-3">
            <BotMessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-2xl">
                AI Risk Analysis
              </CardTitle>
              <CardDescription>
                Paste any technical context to generate an audit report.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="projectName" className="text-sm font-medium leading-none">
                  Project Name <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="e.g. Payment Gateway v2, Legacy API Migration..."
                  className="bg-background/50"
                  disabled={isPending || !access.hasAccess}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="technicalContext" className="text-sm font-medium leading-none">
                    Technical Context
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-primary hover:bg-primary/10"
                    disabled={isPending || !access.hasAccess}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) handleFiles(Array.from(files));
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Load Files
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-primary hover:bg-primary/10"
                    disabled={isPending || !access.hasAccess}
                    onClick={() => setIsUrlDialogOpen(true)}
                  >
                    <Sparkles className="h-4 w-4" />
                    Load from URL
                  </Button>
                </div>
                <Textarea
                  name="technicalContext"
                  placeholder="Paste code snippets, logs, architecture notes, or drag & drop files here..."
                  className="min-h-80 bg-background/50"
                  required
                  disabled={isPending || !access.hasAccess}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <SubmitButton isPending={isPending} hasAccess={access.hasAccess} />
          </form>
        </CardContent>
      </Card>

      <URLImportDialog
        isOpen={isUrlDialogOpen}
        onOpenChange={setIsUrlDialogOpen}
        onImport={async (url) => {
          setLoadingUrl(true);
          try {
            const response = await (window as any).electronAPI.fetchUrlContent(url);
            if (response.success) {
              handleFiles([new File([response.content], response.fileName, { type: 'text/plain' })]);
              setIsUrlDialogOpen(false);
            } else {
              alert(`Error: ${response.error}`);
            }
          } catch (err: any) {
            alert(`Failed to fetch URL: ${err.message}`);
          } finally {
            setLoadingUrl(false);
          }
        }}
        isLoading={loadingUrl}
      />

      <PricingDialog
        open={isPricingOpen}
        onOpenChange={setIsPricingOpen}
        onSuccess={updateAccess}
      />
    </div>
  );
}
