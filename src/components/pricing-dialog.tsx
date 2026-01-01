'use client';

import { useState } from 'react';
import { Check, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommercialLicenseDialog } from './commercial-license-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { activateTrial } from '@/lib/access';
import { useToast } from '@/hooks/use-toast';

interface PricingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function PricingDialog({ open, onOpenChange, onSuccess }: PricingDialogProps) {
    const [promoCode, setPromoCode] = useState('');
    const [isCommercialOpen, setIsCommercialOpen] = useState(false);
    const { toast } = useToast();

    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await activateTrial(promoCode);
        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
    };

    const handlePurchase = async () => {
        if (typeof window !== 'undefined' && window.electronAPI) {
            const response = await (window.electronAPI as any).createCheckoutSession();
            if (response && response.url) {
                (window.electronAPI as any).openExternal(response.url);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: response?.error || 'Failed to initiate checkout.',
                });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Rocket className="h-6 w-6 text-primary" />
                        Upgrade to TechRisk Pro
                    </DialogTitle>
                    <DialogDescription>
                        Unlock unlimited AI-powered risk analysis and premium features.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm ring-1 ring-primary/10">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Pro Plan</h3>
                                <p className="text-sm text-muted-foreground">Lifetime Access</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold">$49</span>
                                <span className="text-sm text-muted-foreground">/once</span>
                            </div>
                        </div>

                        <ul className="mb-6 space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" /> Unlimited Analysis
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" /> Executive Summaries
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" /> Priority AI Model
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" /> PDF Report Export
                            </li>
                        </ul>

                        <Button onClick={handlePurchase} className="w-full" size="lg">
                            <Zap className="mr-2 h-4 w-4 fill-current" /> Buy Now
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or try it out
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handlePromoSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Promo Code
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter 12h trial code..."
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <Button type="submit" variant="secondary">
                                    Activate
                                </Button>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Enter code `TRIAL12` for a 12-hour free trial.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        Secure checkout via Stripe
                    </div>
                    <button
                        onClick={() => setIsCommercialOpen(true)}
                        className="text-primary hover:underline font-medium"
                    >
                        Need a Proprietary/Commercial License?
                    </button>
                </div>
            </DialogContent>
            <CommercialLicenseDialog
                open={isCommercialOpen}
                onOpenChange={setIsCommercialOpen}
            />
        </Dialog>
    );
}
