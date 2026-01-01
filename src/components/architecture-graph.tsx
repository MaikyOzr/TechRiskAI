'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Maximize2 } from 'lucide-react';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#1e293b',
        primaryTextColor: '#fff',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#ef4444',
        tertiaryColor: '#1e293b',
        fontFamily: 'inherit',
        fontSize: '14px',
    },
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 15,
        nodeSpacing: 50,
        rankSpacing: 50,
    },
    securityLevel: 'loose',
});

interface ArchitectureGraphProps {
    code: string;
}

export function ArchitectureGraph({ code }: ArchitectureGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function renderGraph() {
            if (!code) return;
            setLoading(true);
            setError(null);

            try {
                // Ensure flowchart LR is used instead of graph LR for better formatting
                const normalizedCode = code.replace(/^graph\s+/, 'flowchart ');
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, normalizedCode);
                setSvg(svg);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError('Failed to render architecture diagram.');
            } finally {
                setLoading(false);
            }
        }

        renderGraph();
    }, [code]);

    return (
        <Card className="overflow-hidden shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2 font-headline">
                    <Maximize2 className="h-5 w-5 text-primary" />
                    Visual Architecture Heatmap
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    LIVE SCHEMA
                </div>
            </CardHeader>
            <CardContent className="relative flex min-h-[450px] items-center justify-center p-8">
                {loading && (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                        <p className="text-xs tracking-widest uppercase opacity-50">Mapping System Infrastructure...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-2 text-destructive">
                        <p className="text-sm font-medium">{error}</p>
                        <p className="text-xs opacity-70">The system context might be too complex for immediate visualization.</p>
                    </div>
                )}

                <div
                    ref={containerRef}
                    className="w-full h-full flex justify-center mermaid-container transition-opacity duration-500"
                    style={{ opacity: loading ? 0 : 1 }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />

                <div className="absolute bottom-4 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 text-[9px] text-muted-foreground italic backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-red-500/20 border border-red-500/50" />
                    Heatmap style: Pink components indicate potential risk zones.
                </div>
            </CardContent>

            <style jsx global>{`
        .mermaid-container svg {
          height: auto;
          max-width: 100%;
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.3));
        }
        .mermaid-container .node rect, 
        .mermaid-container .node circle, 
        .mermaid-container .node polygon,
        .mermaid-container .node path {
          stroke-width: 1.5px !important;
          rx: 8px !important;
          ry: 8px !important;
        }
        .mermaid-container .node .label {
          font-weight: 600 !important;
          font-size: 13px !important;
          fill: #f8fafc !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
        }
        .mermaid-container .edgePath .path {
          stroke: #3b82f6 !important;
          stroke-width: 1.5px !important;
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .mermaid-container .edgePath:hover .path {
            opacity: 1;
            stroke-width: 2.5px !important;
        }
        .mermaid-container .markerPath {
          fill: #3b82f6 !important;
          opacity: 0.6;
        }
        .mermaid-container .node[id*="red"] rect,
        .mermaid-container .node .label-container[style*="fill: rgb(239, 68, 68)"] {
            filter: drop-shadow(0 0 10px rgba(239,68,68,0.4));
        }
      `}</style>
        </Card>
    );
}
