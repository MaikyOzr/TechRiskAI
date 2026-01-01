'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Building2, CheckCircle2, Mail } from 'lucide-react';

interface CommercialLicenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommercialLicenseDialog({ open, onOpenChange }: CommercialLicenseDialogProps) {
    const [submitted, setSubmitted] = useState(false);

    const handleContact = () => {
        // In a real app, this would open a mailto or send a request
        setSubmitted(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-primary/20 bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
                        <Building2 className="h-6 w-6 text-primary" />
                        Enterprise Commercial License
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                        For organizations with closed-source policies that cannot comply with the AGPL-3.0 copyleft requirements.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 space-y-3">
                        <h4 className="font-semibold text-primary flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Why a Commercial License?
                        </h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>Remove requirement to share your derivative work's source code.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>Priority support and custom deployment options for enterprise.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>Internal auditing and compliance certification assistance.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center space-y-4">
                        {submitted ? (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                                <p className="font-semibold">Inquiry Sent!</p>
                                <p className="text-xs">Our legal team will reach out to you shortly.</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Pricing for commercial licenses is tailored to organization size and deployment needs.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {!submitted && (
                        <Button className="gap-2" onClick={handleContact}>
                            <Mail className="h-4 w-4" />
                            Request Quote
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
