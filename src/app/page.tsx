'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertCircle, BotMessageSquare } from 'lucide-react';
import { analyzeAction } from '@/app/actions';
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
import type { AnalysisReport } from '@/lib/types';

const initialState: {
  data: AnalysisReport | null;
  error: string | null;
} = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? 'Analyzing...' : 'Generate Report'}
    </Button>
  );
}

export default function Home() {
  const router = useRouter();
  const [state, formAction] = useActionState(analyzeAction, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.data) {
      const id = Date.now().toString();
      try {
        const history = JSON.parse(
          localStorage.getItem('techrisk_history') || '{}'
        );
        history[id] = {
          data: state.data,
          timestamp: Date.now(),
        };
        localStorage.setItem('techrisk_history', JSON.stringify(history));
        router.push(`/report/${id}`);
      } catch (error) {
        console.error('Failed to save to localStorage', error);
      }
    }
  }, [state.data, router]);

  if (pending) {
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
          <form action={formAction} className="space-y-4">
            <div className="grid w-full gap-2">
              <Textarea
                name="technicalContext"
                placeholder="Paste code snippets, logs, architecture notes, or other technical context here..."
                className="min-h-80"
                required
              />
            </div>
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
