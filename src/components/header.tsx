'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingDialog } from './pricing-dialog';
import { checkAccess, AccessStatus } from '@/lib/access';
import { Badge } from '@/components/ui/badge';

export default function Header() {
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
    updateAccess();
    // Refresh access status periodically
    const interval = setInterval(updateAccess, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block font-headline">
              TechRisk
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono opacity-70">
              v0.7.0
            </Badge>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {access.isTrial && (
              <Badge variant="outline" className="mr-2 flex items-center gap-1 border-primary/50 bg-primary/5 px-3 py-1 text-primary">
                <Clock className="h-3 w-3" />
                Trial: {access.trialRemainingHours}h
              </Badge>
            )}
            {!access.hasAccess || access.isTrial ? (
              <Button
                variant="default"
                size="sm"
                className="mr-2"
                onClick={() => setIsPricingOpen(true)}
              >
                <Zap className="mr-1 h-3.5 w-3.5 fill-current" />
                Upgrade
              </Button>
            ) : (
              <Badge variant="outline" className="mr-2 border-green-500/50 bg-green-500/5 text-green-500">
                PRO
              </Badge>
            )}
            <Button variant="ghost" asChild>
              <Link href="/">New Analysis</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/history">History</Link>
            </Button>
          </nav>
        </div>
      </div>
      <PricingDialog
        open={isPricingOpen}
        onOpenChange={setIsPricingOpen}
        onSuccess={updateAccess}
      />
    </header>
  );
}
