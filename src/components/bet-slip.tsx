'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronLeft, Receipt, Trash2, X, Calculator } from 'lucide-react';
import { useBetSlipStore } from '@/store/use-bet-slip';

export default function BetSlip() {
    const [isOpen, setIsOpen] = useState(true);
    const { items, removeItem, clearSlip } = useBetSlipStore();

    // Zaštita od Hydration Error-a (jer Next.js server ne vidi localStorage)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <aside
            className={`hidden xl:block relative transition-[width] duration-300 ease-in-out z-30 ${isOpen ? 'w-[320px]' : 'w-0'
                }`}
        >
            <div className="absolute top-0 left-0 h-full w-[320px] border-l border-border bg-background">
                <div className="sticky top-[80px] h-[calc(100vh-80px)] w-full p-4 flex flex-col">

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`absolute bottom-6 z-50 shadow-md transition-all duration-300 ease-in-out flex items-center justify-center ${isOpen
                            ? '-left-5 rounded-full w-10 h-10 border border-border bg-background text-slate-500 hover:text-foreground'
                            : '-left-[52px] rounded-l-md rounded-r-none w-[52px] h-12 border-y border-l border-r-0 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:w-[60px] hover:-left-[60px]'
                            }`}
                        aria-label={isOpen ? "Uvuci tiket" : "Izvuci tiket"}
                    >
                        {isOpen ? (
                            <ChevronRight size={20} />
                        ) : (
                            <div className="flex items-center pr-1 relative">
                                <ChevronLeft size={18} className="mr-0.5" />
                                <Receipt size={20} />
                                {/* Bedž na zatvorenom dugmetu ako ima mečeva */}
                                {isMounted && items.length > 0 && (
                                    <span className="absolute -top-2 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {items.length}
                                    </span>
                                )}
                            </div>
                        )}
                    </Button>

                    <Card className="border-border/60 shadow-sm flex-1 flex flex-col overflow-hidden">

                        {/* ZAGLAVLJE */}
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50 shrink-0 py-4">
                            <CardTitle className="font-headline text-lg uppercase text-primary tracking-wider flex justify-between items-center">
                                <span>Bet Slip</span>
                                {isMounted && items.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearSlip} className="h-7 px-2 text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                        Očisti
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>

                        {/* LISTA MEČEVA SA SKROLOM */}
                        <ScrollArea className="flex-1 w-full">
                            <CardContent className="p-4">
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
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
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
                        </ScrollArea>

                        {/* DUGME ZA KALKULACIJU (Fiksirano na dnu tiketa) */}
                        {isMounted && items.length > 0 && (
                            <div className="p-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                                <Button className="w-full font-bold tracking-wide shadow-sm h-12" size="lg">
                                    <Calculator className="w-5 h-5 mr-2" />
                                    KALKULACIJA
                                </Button>
                            </div>
                        )}

                    </Card>
                </div>
            </div>
        </aside>
    );
}