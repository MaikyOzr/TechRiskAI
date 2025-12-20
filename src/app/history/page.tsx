'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, FileWarning, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type HistoryEntry = {
  data: {
    executiveSummary: string;
    riskReport: { severity: 'low' | 'medium' | 'high' }[];
  };
  timestamp: number;
};

type HistoryData = Record<string, HistoryEntry>;

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryData>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem('techrisk_history') || '{}'
      );
      setHistory(savedHistory);
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      setHistory({});
    }
  }, []);

  const sortedHistory = Object.entries(history).sort(
    ([, a], [, b]) => b.timestamp - a.timestamp
  );

  const getSeverityCounts = (entry: HistoryEntry) => {
    const counts = { high: 0, medium: 0, low: 0 };
    entry.data.riskReport.forEach(risk => {
      counts[risk.severity]++;
    });
    return counts;
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  if (sortedHistory.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <FileWarning className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold font-headline">No History Found</h1>
        <p className="max-w-sm text-muted-foreground">
          You haven't run any analyses yet. Go ahead and start your first one!
        </p>
        <Button asChild>
          <Link href="/">New Analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-4 py-8 md:p-8">
      <div className="flex items-center gap-2">
        <HistoryIcon className="h-8 w-8" />
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Analysis History
        </h1>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Risk Profile</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map(([id, entry]) => {
                const counts = getSeverityCounts(entry);
                return (
                  <TableRow key={id}>
                    <TableCell className="w-[180px]">
                      {formatDistanceToNow(new Date(entry.timestamp), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {entry.data.executiveSummary}
                      </p>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        {counts.high > 0 && <Badge variant="destructive">H: {counts.high}</Badge>}
                        {counts.medium > 0 && <Badge variant="default" className="bg-accent text-accent-foreground hover:bg-accent/80">M: {counts.medium}</Badge>}
                        {counts.low > 0 && <Badge variant="secondary">L: {counts.low}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/report/${id}`} title="View Report">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
