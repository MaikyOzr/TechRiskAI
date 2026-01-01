'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Database, Zap, FileSearch2, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const STEPS = [
  { id: 1, label: 'Reading technical context...', icon: FileSearch2, color: 'text-blue-500' },
  { id: 2, label: 'Cross-referencing vulnerabilities...', icon: ShieldAlert, color: 'text-red-500' },
  { id: 3, label: 'Evaluating architecture patterns...', icon: Database, color: 'text-purple-500' },
  { id: 4, label: 'Generating executive summary...', icon: Zap, color: 'text-amber-500' },
];

const LOGS = [
  '[INFO] Initializing Genkit AI workspace...',
  '[SCAN] Analyzing package.json for deprecated libraries...',
  '[WARN] Potential memory leak pattern detected in useEffect...',
  '[INFO] Comparing database schema with best practices...',
  '[AI] Synthesizing risk mitigation strategies...',
  '[PDF] Preparing report blocks...',
  '[AUTH] Validating session permissions...',
];

export function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 500);

    const logInterval = setInterval(() => {
      setActiveLogs((prev) => {
        const nextLog = LOGS[Math.floor(Math.random() * LOGS.length)];
        return [nextLog, ...prev].slice(0, 5);
      });
    }, 2000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="border-b bg-muted/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold">AI Audit Workspace</h2>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Performing deep technical risk analysis...</p>
          <Progress value={progress} className="mt-6 h-2" />
        </div>

        <div className="grid md:grid-cols-2">
          <div className="space-y-6 p-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105 opacity-100' : 'opacity-40'}`}
                >
                  <div className={`rounded-full p-2 ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-muted'}`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className={`h-5 w-5 ${isActive ? step.color : ''}`} />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    {isActive && <span className="text-[10px] uppercase tracking-wider text-primary animate-pulse">Processing...</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-black/95 p-6 font-mono text-[11px] leading-relaxed text-green-500/80">
            <div className="mb-2 text-green-200 border-b border-green-900 pb-1 flex justify-between">
              <span>SYSTEM LOGS</span>
              <span className="animate-pulse">LIVE</span>
            </div>
            {activeLogs.map((log, i) => (
              <div key={i} className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                {log}
              </div>
            ))}
            <div className="mt-4 flex gap-1">
              <div className="h-2 w-1 bg-green-500 animate-bounce" />
              <div className="h-2 w-1 bg-green-500 animate-bounce delay-75" />
              <div className="h-2 w-1 bg-green-500 animate-bounce delay-150" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground italic">
        "One must always be careful of books and what is inside them, for words have the power to change us."
      </p>
    </div>
  );
}
