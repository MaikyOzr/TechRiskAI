import { Loader2 } from 'lucide-react';

export function LoadingAnalysis() {
  const messages = [
    'Performing static analysis on code snippets...',
    'Cross-referencing with security vulnerability databases...',
    'Evaluating scalability of architecture patterns...',
    'Checking for outdated dependencies and configurations...',
    'Compiling executive summary for business stakeholders...',
  ];

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] flex-col items-center justify-center p-4 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="mt-6 font-headline text-2xl font-bold">
        Analyzing Your Project
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        This may take a moment. Our AI is performing a detailed audit to identify potential risks and improvements.
      </p>
      <div className="mt-8 w-full max-w-md space-y-2 overflow-hidden">
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {messages[Math.floor(Math.random() * messages.length)]}
        </p>
      </div>
    </div>
  );
}
