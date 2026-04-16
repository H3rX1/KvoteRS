'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useBetSlipStore } from '@/store/use-bet-slip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, TrendingUp, AlertCircle, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CalculatorClient() {
    const { items } = useBetSlipStore();
    const [stake, setStake] = useState<string>('1000');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- PRAVA MATEMATIKA ---
    const bookieResults = useMemo(() => {
        if (items.length === 0) return [];

        // Mapa koja prati ukupnu kvotu i broj pronađenih mečeva za svaku kladionicu
        const bookieMap = new Map<string, { totalOdds: number; matchCount: number }>();

        items.forEach((item) => {
            // Sigurnosna provera u slučaju da all_odds nije učitan
            const oddsList = item.all_odds || [];

            oddsList.forEach((oddEntry) => {
                // Izvlačimo pravu vrednost kvote na osnovu onoga šta je korisnik odigrao na tiketu
                let oddValue = 0;
                if (item.selection === '1') oddValue = oddEntry.odd_1 || 0;
                else if (item.selection === 'X') oddValue = oddEntry.odd_x || 0;
                else if (item.selection === '2') oddValue = oddEntry.odd_2 || 0;

                // Ako kladionica ima validnu kvotu za ovaj tip
                if (oddValue > 0) {
                    if (!bookieMap.has(oddEntry.bookie_name)) {
                        bookieMap.set(oddEntry.bookie_name, { totalOdds: 1, matchCount: 0 });
                    }
                    const bData = bookieMap.get(oddEntry.bookie_name)!;
                    bData.totalOdds *= oddValue;
                    bData.matchCount += 1;
                }
            });
        });

        // Filtriramo SAMO one kladionice koje imaju kvote za SVE mečeve na tiketu
        const validBookies: { name: string; totalOdds: number }[] = [];
        bookieMap.forEach((data, bookieName) => {
            if (data.matchCount === items.length) {
                validBookies.push({
                    name: bookieName,
                    totalOdds: data.totalOdds,
                });
            }
        });

        // Sortiramo po najvećoj ukupnoj kvoti padajuće
        return validBookies.sort((a, b) => b.totalOdds - a.totalOdds);
    }, [items]);

    if (!isMounted) return null;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <Calculator className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold font-headline mb-2 text-foreground">Vaš tiket je prazan</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Dodajte mečeve na tiket kako biste uporedili u kojoj kladionici imate najveći potencijalni dobitak.
                </p>
                <Link href="/">
                    <Button size="lg" className="font-bold tracking-wide">
                        POGLEDAJ PONUDU
                    </Button>
                </Link>
            </div>
        );
    }

    const parsedStake = parseFloat(stake) || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6 w-full min-w-0">

            <div className="flex items-center gap-3 mb-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border/50">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
                        Kalkulacija Tiketa
                    </h2>
                    <p className="text-sm text-muted-foreground">Uporedite potencijalni dobitak u svim kladionicama</p>
                </div>
            </div>

            <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardContent className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Vaš Ulog (RSD)
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="20"
                                    value={stake}
                                    onChange={(e) => setStake(e.target.value)}
                                    className="text-2xl font-bold h-14 pl-4 pr-16 tabular-nums"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                    RSD
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-6">
                            {[500, 1000, 2000, 5000].map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    className="flex-1 md:flex-none font-semibold"
                                    onClick={() => setStake((prev) => (parseFloat(prev || '0') + amount).toString())}
                                >
                                    +{amount}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Gde se najviše isplati odigrati?
                </h3>

                <div className="grid gap-4">
                    {bookieResults.length > 0 ? (
                        bookieResults.map((bookie, index) => {
                            const isBest = index === 0;
                            const payout = parsedStake * bookie.totalOdds;

                            return (
                                <div
                                    key={bookie.name}
                                    className={cn(
                                        "relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border transition-all overflow-hidden",
                                        isBest
                                            ? "bg-best-odds-green/5 border-best-odds-green/40 shadow-sm"
                                            : "bg-card border-border/60 hover:border-border"
                                    )}
                                >
                                    {isBest && (
                                        <div className="absolute top-0 right-0 bg-best-odds-green text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                                            <Trophy className="w-3 h-3" /> Najbolja ponuda
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 w-full sm:w-auto sm:min-w-[160px]">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
                                            <img
                                                src={`/bookies/${bookie.name.toLowerCase()}.png`}
                                                alt={bookie.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="hidden w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                                                {bookie.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="font-headline font-bold text-lg sm:text-xl capitalize">
                                            {bookie.name}
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 gap-4 w-full sm:w-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ukupna Kvota</span>
                                            <span className="font-bold text-lg tabular-nums">
                                                {bookie.totalOdds.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mogući Dobitak</span>
                                            <span className={cn(
                                                "font-bold text-xl sm:text-2xl tabular-nums tracking-tight",
                                                isBest ? "text-best-odds-green" : "text-foreground"
                                            )}>
                                                {payout.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-muted-foreground">RSD</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                        <Button
                                            className={cn(
                                                "w-full sm:w-[140px] font-bold tracking-wide h-12",
                                                isBest ? "bg-best-odds-green hover:bg-best-odds-green/90 text-white" : ""
                                            )}
                                        >
                                            ODIGRAJ <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // Prikazuje se ako ne postoji NIJEDNA kladionica koja nudi apsolutno sve mečeve sa tiketa
                        <div className="text-center p-8 border border-dashed border-border/60 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                            <p className="font-semibold text-foreground text-lg">Nema poklapanja</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                Nijedna kladionica ne nudi kvote za sve izabrane mečeve istovremeno. Pokušajte da uklonite neki meč sa tiketa sa desne strane.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}