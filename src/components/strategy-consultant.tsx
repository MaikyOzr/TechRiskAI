'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, Code, ArrowRight } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    codeSnippet?: string;
    nextSteps?: string[];
}

interface StrategyConsultantProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    risk: {
        description: string;
        recommendation: string;
    };
    technicalContext: string;
}

export function StrategyConsultant({ isOpen, onOpenChange, risk, technicalContext }: StrategyConsultantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const result = await (window as any).electronAPI.consultRisk({
                riskDescription: risk.description,
                recommendation: risk.recommendation,
                technicalContext: technicalContext,
                userQuestion: userMsg
            });

            if (result.success) {
                console.log('Consultation Success:', result.data);
                const data = result.data;
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.answer || data.recommendation || data.explanation || 'No text answer provided.',
                    codeSnippet: data.codeSnippet || (data.codeExample ? data.codeExample.snippet : undefined),
                    nextSteps: data.nextSteps || data.steps
                }]);
            } else {
                console.error('Consultation Failed:', result.error);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Error: ${result.error || 'The consultant failed to generate a response in the correct format.'}`
                }]);
            }
        } catch (error: any) {
            console.error('Consultation Exception:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Connection failed: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        Strategy Consultant
                    </DialogTitle>
                    <DialogDescription>
                        Asking help for: <span className="font-semibold text-foreground">{risk.description}</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <Bot className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                <p>Ask me how to implement the recommendation or for a code example.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`flex flex-col gap-4 max-w-[85%] min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-2xl p-4 text-sm break-all whitespace-pre-wrap w-full ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>

                                    {msg.codeSnippet && (
                                        <div className="rounded-lg bg-black/90 p-4 font-mono text-xs text-green-400 overflow-x-auto w-full border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground border-b border-white/10 pb-2">
                                                <Code className="h-3 w-3" />
                                                Suggested Implementation
                                            </div>
                                            <pre className="whitespace-pre overflow-x-auto pb-2"><code>{msg.codeSnippet}</code></pre>
                                        </div>
                                    )}

                                    {msg.nextSteps && msg.nextSteps.length > 0 && (
                                        <div className="space-y-2 w-full min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                                Next Steps <ArrowRight className="h-3 w-3" />
                                            </p>
                                            <div className="grid gap-2 w-full">
                                                {msg.nextSteps.map((step, si) => (
                                                    <div key={si} className="flex items-start gap-3 text-xs bg-primary/5 border border-primary/20 p-3 rounded-md hover:bg-primary/10 transition-colors break-all overflow-hidden">
                                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">
                                                            {si + 1}
                                                        </div>
                                                        <div className="flex-1 pt-0.5 leading-relaxed">{step}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center animate-pulse">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-xs">Consultant is thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t gap-2">
                    <Input
                        placeholder="Type your question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
