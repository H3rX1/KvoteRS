'use client';

import React, { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Trash2, X, Calculator } from 'lucide-react';
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from '@/components/ui/sheet';
import { useBetSlipStore } from '@/store/use-bet-slip';

export default function BetSlipMobile() {
    const [isOpen, setIsOpen] = useState(false);

    // Povezujemo se sa našim Zustand store-om
    const { items, removeItem, clearSlip } = useBetSlipStore();

    // Zaštita od Hydration Error-a (SSR vs Client LocalStorage)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="xl:hidden">
            {/* Plutajuće dugme fiksirano na dnu ekrana */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-transform active:scale-95"
                aria-label="Otvori tiket"
            >
                <Receipt size={24} />
                {/* Crveni bedž sa brojem mečeva */}
                {isMounted && items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background shadow-sm">
                        {items.length}
                    </span>
                )}
            </Button>

            {/* Modal (Sheet) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col bg-background border-l-0 sm:border-l">

                    <SheetTitle className="sr-only">Vaš Bet Slip</SheetTitle>

                    <div className="flex flex-col h-full">
                        {/* ZAGLAVLJE */}
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50 shrink-0 py-4">
                            <CardTitle className="font-headline text-lg uppercase text-primary tracking-wider flex items-center justify-between px-6">
                                <span>Bet Slip</span>
                                {isMounted && items.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearSlip} className="h-7 px-2 text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                        Očisti
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>

                        {/* SADRŽAJ TIKETA */}
                        <CardContent className="p-6 flex-1 overflow-y-auto">
                            {!isMounted ? null : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center space-y-3 whitespace-normal mt-10">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                        <span className="text-2xl opacity-50">🎫</span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Vaš tiket je prazan</p>
                                    <p className="text-xs text-muted-foreground">
                                        Kliknite na neku od kvota u tabeli kako biste dodali meč na tiket.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="relative group bg-slate-50 dark:bg-slate-800/40 border border-border/50 rounded-md p-3 transition-colors hover:border-border">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-opacity p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            <div className="text-xs font-semibold text-muted-foreground mb-1 capitalize">
                                                {item.bookie}
                                            </div>

                                            <div className="text-sm font-medium leading-tight pr-6 text-foreground">
                                                {item.homeTeam} <span className="text-muted-foreground font-normal mx-1">vs</span> {item.awayTeam}
                                            </div>

                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/40">
                                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                                    Tip: {item.selection}
                                                </span>
                                                <span className="font-bold tabular-nums text-foreground">
                                                    {item.oddValue.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        {/* DUGME ZA KALKULACIJU (Fiksirano na dnu) */}
                        {isMounted && items.length > 0 && (
                            <Link href="/kalkulacija">
                                <div className="p-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                                    <Button className="w-full font-bold tracking-wide shadow-sm h-12" size="lg">
                                        <Calculator className="w-5 h-5 mr-2" />
                                        KALKULACIJA
                                    </Button>
                                </div>
                            </Link>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}