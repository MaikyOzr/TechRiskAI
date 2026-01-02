'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Maximize2, ZoomIn, ZoomOut, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        fontSize: '18px',
    },
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 30,
        nodeSpacing: 80,
        rankSpacing: 80,
    },
    securityLevel: 'loose',
});

interface ArchitectureGraphProps {
    code: string;
}

export function ArchitectureGraph({ code }: ArchitectureGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Zoom and Pan state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

    // Update SVG ref when SVG content changes
    useEffect(() => {
        if (containerRef.current && svg) {
            const svgElement = containerRef.current.querySelector('svg');
            svgRef.current = svgElement;
        }
    }, [svg]);

    // Prevent page scroll when zooming graph
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelNative = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(0.1, scale * delta), 5);
            setScale(newScale);
        };

        container.addEventListener('wheel', handleWheelNative, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheelNative);
        };
    }, [scale]);

    // Zoom and Pan handlers
    const handleWheel = (e: React.WheelEvent) => {
        // This is now handled by native event listener above
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left mouse button
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.2, 5));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev / 1.2, 0.1));
    };

    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <Card className="overflow-hidden shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col h-full">
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
            <CardContent className="relative flex flex-1 h-full items-center justify-center p-4">
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
                    className="w-full flex-1 flex items-center justify-center mermaid-container transition-opacity duration-500 overflow-hidden min-h-[500px]"
                    style={{
                        opacity: loading ? 0 : 1,
                        cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </div>

                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 shadow-lg"
                        onClick={handleZoomIn}
                        title="Zoom In"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 shadow-lg"
                        onClick={handleZoomOut}
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 shadow-lg"
                        onClick={handleResetZoom}
                        title="Reset Zoom"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                    <div className="text-[10px] text-center text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border/50">
                        {Math.round(scale * 100)}%
                    </div>
                </div>

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
          shape-rendering: geometricPrecision;
          text-rendering: geometricPrecision;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        .mermaid-container .node rect, 
        .mermaid-container .node circle, 
        .mermaid-container .node polygon,
        .mermaid-container .node path {
          stroke-width: 1.5px !important;
          rx: 8px !important;
          ry: 8px !important;
          min-width: 150px !important;
        }
        .mermaid-container .node .label {
          font-weight: 600 !important;
          font-size: 17px !important;
          fill: #f8fafc !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 220px !important;
          padding: 10px 14px !important;
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
