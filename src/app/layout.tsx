import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';

// Placeholder for missing font variables
const fontBody = { variable: 'font-sans' };
const fontHeadline = { variable: 'font-sans' };

export const metadata: Metadata = {
  title: 'TechRisk: AI-Powered Risk Analysis',
  description:
    'Perform evidence-based audits of your technical assets to identify risks, get executive summaries, and receive actionable recommendations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'min-h-screen font-body antialiased',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
