'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Receipt } from 'lucide-react';

export default function BetSlip() {
    // Stanje koje prati da li je tiket izvučen (true) ili uvučen (false)
    const [isOpen, setIsOpen] = useState(true);

    return (
        <aside
            className={`hidden xl:block relative transition-[width] duration-300 ease-in-out z-30 ${isOpen ? 'w-[320px]' : 'w-0'
                }`}
        >
            {/* Apsolutni kontejner koji sadrži sadržaj. 
                Kako se širina <aside> menja u 0, ovaj kontejner glatko klizi van ekrana udesno.
            */}
            <div className="absolute top-0 left-0 h-full w-[320px] border-l border-border bg-background">
                <div className="sticky top-[80px] h-[calc(100vh-80px)] w-full">

                    {/* Plutajuće dugme za uvlačenje/izvlačenje (Dole levo) */}
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
                            <div className="flex items-center pr-1">
                                <ChevronLeft size={18} className="mr-0.5" />
                                <Receipt size={20} />
                            </div>
                        )}
                    </Button>

                    {/* Sadržaj tiketa */}
                    <div className="p-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50">
                                <CardTitle className="font-headline text-lg uppercase text-primary tracking-wider">
                                    Bet Slip
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center text-center space-y-3 whitespace-normal">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                        <span className="text-2xl opacity-50">🎫</span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Vaš tiket je prazan</p>
                                    <p className="text-xs text-muted-foreground">
                                        Kliknite na neku od kvota u tabeli kako biste dodali meč na tiket.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </aside>
    );
}