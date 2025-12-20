'use client';

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  TriangleAlert,
  Info,
  Wrench,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { RiskReportItem } from '@/lib/types';

type Severity = RiskReportItem['severity'];
type Effort = RiskReportItem['effort'];

const severityConfig: Record<
  Severity,
  {
    icon: React.ElementType;
    label: string;
    badgeClass: string;
  }
> = {
  high: {
    icon: ShieldAlert,
    label: 'High',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  medium: {
    icon: TriangleAlert,
    label: 'Medium',
    badgeClass: 'bg-accent/10 text-accent-foreground border-accent/20',
  },
  low: {
    icon: Info,
    label: 'Low',
    badgeClass: 'bg-secondary text-secondary-foreground border-border',
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.low;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`flex shrink-0 items-center gap-1.5 ${config.badgeClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}

const effortConfig: Record<
  Effort,
  {
    label: string;
  }
> = {
  high: { label: 'High Effort' },
  medium: { label: 'Medium Effort' },
  low: { label: 'Low Effort' },
};

export function EffortBadge({ effort }: { effort: Effort }) {
  const config = effortConfig[effort] || effortConfig.low;

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-2 border-dashed bg-transparent"
    >
      <Wrench className="h-4 w-4 text-muted-foreground" />
      <span>{config.label}</span>
    </Badge>
  );
}

export function BenefitItem({ benefit }: { benefit: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <TrendingUp className="h-4 w-4 text-primary" />
      <div>
        <span className="font-semibold text-foreground">Expected Benefit:</span>{' '}
        {benefit}
      </div>
    </div>
  );
}

export function ShareButton() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        toast({
          title: 'Link Copied',
          description: 'The report link has been copied to your clipboard.',
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <Button onClick={handleCopy} variant="outline" className="shrink-0">
      {copied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Share Report'}
    </Button>
  );
}
