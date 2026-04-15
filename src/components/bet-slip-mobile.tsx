'use client';

import React, { useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTitle, // <-- DODALI SMO OVO
} from '@/components/ui/sheet';

export default function BetSlipMobile() {
    // Stanje za otvaranje/zatvaranje mobilnog tiketa
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="xl:hidden">
            {/* Plutajuće dugme fiksirano na dnu ekrana */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-transform active:scale-95"
                aria-label="Otvori tiket"
            >
                <Receipt size={24} />
            </Button>

            {/* Modal (Sheet) koji iskače sa desne strane ili preko celog ekrana */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col bg-background border-l-0 sm:border-l">

                    {/* DODATO: Nevidljivi naslov koji rešava Radix grešku i pomaže slepim osobama */}
                    <SheetTitle className="sr-only">Vaš Bet Slip</SheetTitle>

                    <div className="flex flex-col h-full">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50 shrink-0 py-4">
                            <CardTitle className="font-headline text-lg uppercase text-primary tracking-wider flex items-center justify-between px-6">
                                <span>Bet Slip</span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 flex-1 overflow-y-auto">
                            <div className="flex flex-col items-center justify-center text-center space-y-3 whitespace-normal mt-10">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                    <span className="text-2xl opacity-50">🎫</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">Vaš tiket je prazan</p>
                                <p className="text-xs text-muted-foreground">
                                    Kliknite na neku od kvota u tabeli kako biste dodali meč na tiket.
                                </p>
                            </div>
                        </CardContent>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}