'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { History as HistoryIcon, FileWarning, Eye, BarChart as BarChartIcon, Activity } from 'lucide-react';
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
} from '@/components/ui/card';
import { secureStorage } from '@/lib/storage';

type HistoryEntry = {
  projectName?: string;
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadHistory = async () => {
      setIsClient(true);
      const savedHistory = (await secureStorage.getItem<HistoryData>('techrisk_history')) || {};
      setHistory(savedHistory);
    };
    loadHistory();
  }, []);

  const sortedHistory = Object.entries(history).sort(
    ([, a], [, b]) => b.timestamp - a.timestamp
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const getSeverityCounts = (entry: HistoryEntry) => {
    const counts = { high: 0, medium: 0, low: 0 };
    entry.data.riskReport.forEach(risk => {
      counts[risk.severity]++;
    });
    return counts;
  };

  const groupedHistory = sortedHistory.reduce((acc, [id, entry]) => {
    const projectName = entry.projectName || 'Default Project';
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push({ id, ...entry });
    return acc;
  }, {} as Record<string, (HistoryEntry & { id: string })[]>);

  if (!isClient) {
    return null;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-8 w-8" />
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Analysis History
          </h1>
        </div>

        {selectedIds.length === 2 && (
          <Button
            onClick={() => router.push(`/compare?idA=${selectedIds[0]}&idB=${selectedIds[1]}`)}
            className="bg-primary hover:bg-primary/90 shadow-lg animate-in fade-in slide-in-from-right-4"
          >
            Compare Selected Reports
          </Button>
        )}
      </div>

      <div className="space-y-12">
        {Object.entries(groupedHistory).map(([projectName, reports]) => (
          <div key={projectName} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-headline text-primary/80">{projectName}</h2>
                <Badge variant="outline" className="bg-primary/5">{reports.length} report{reports.length > 1 ? 's' : ''}</Badge>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                <Link href={`/analytics?project=${encodeURIComponent(projectName)}`}>
                  <BarChartIcon className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Risk Profile</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const counts = getSeverityCounts(report);
                      const isSelected = selectedIds.includes(report.id);
                      return (
                        <TableRow
                          key={report.id}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                          onClick={() => toggleSelection(report.id)}
                        >
                          <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                            <div
                              className={`h-4 w-4 rounded border transition-colors flex items-center justify-center cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}
                              onClick={() => toggleSelection(report.id)}
                            >
                              {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                            </div>
                          </TableCell>
                          <TableCell className="w-[180px]">
                            {formatDistanceToNow(new Date(report.timestamp), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {report.data.executiveSummary}
                            </p>
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              {counts.high > 0 && <Badge variant="destructive" className="border-red-500/50 bg-red-500/20 text-red-100 hover:bg-red-500/30">H: {counts.high}</Badge>}
                              {counts.medium > 0 && <Badge variant="default" className="border-amber-500/50 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30">M: {counts.medium}</Badge>}
                              {counts.low > 0 && <Badge variant="secondary">L: {counts.low}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                              <Link href={`/report?id=${report.id}`} title="View Report">
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
        ))}
      </div>
    </div>
  );
}
