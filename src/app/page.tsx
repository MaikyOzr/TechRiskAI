'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BotMessageSquare } from 'lucide-react';
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
import { LoadingAnalysis } from '@/components/loading-analysis';
import { analyzeAction } from './actions';
import type { PerformAIRiskAnalysisOutput } from '@/ai/flows/perform-ai-risk-analysis';

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

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} size="lg" className="w-full">
      {isPending ? 'Analyzing...' : 'Generate Report'}
    </Button>
  );
}

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisResult = (result: PerformAIRiskAnalysisOutput) => {
    if (!result || !result.riskReport || !result.executiveSummary) {
      throw new Error('Invalid response from AI model.');
    }

    const id = Date.now().toString();
    const history = JSON.parse(
      localStorage.getItem('techrisk_history') || '{}'
    );
    history[id] = {
      data: result,
      timestamp: Date.now(),
    };
    localStorage.setItem('techrisk_history', JSON.stringify(history));
    router.push(`/report?id=${id}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const technicalContext = formData.get('technicalContext') as string;

    if (!technicalContext || technicalContext.trim().length < 50) {
      setError(
        'Please provide sufficient technical context (at least 50 characters).'
      );
      return;
    }

    startTransition(async () => {
  try {
    // ALWAYS use Next.js server action
    const result = await analyzeAction({ technicalContext });
    handleAnalysisResult(result);
  } catch (e: any) {
    console.error(e);
    setError(
      e.message ||
        'An error occurred during analysis. The AI model may be unavailable. Please try again later.'
    );
  }
});
  };

  if (isPending) {
    return <LoadingAnalysis />;
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
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
            <div className="grid w-full gap-2">
              <Textarea
                name="technicalContext"
                placeholder="Paste code snippets, logs, architecture notes, or other technical context here..."
                className="min-h-80"
                required
                disabled={isPending}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <SubmitButton isPending={isPending} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
