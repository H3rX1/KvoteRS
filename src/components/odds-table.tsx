'use client';

import React from 'react';
import type { MatchWithOdds } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useBetSlipStore } from '@/store/use-bet-slip'; // <-- Uvozimo Zustand store
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface OddsTableClientProps {
    match: MatchWithOdds;
}

export default function OddsTableClient({ match }: OddsTableClientProps) {
    // 1. Povlačimo podatke i funkcije iz našeg Zustand "mozga"
    const { items, addItem, removeItem } = useBetSlipStore();

    // Funkcija za pronalaženje najboljih kvota
    const bestOdds = React.useMemo(() => {
        const best = { odd_1: 0, odd_x: 0, odd_2: 0 };
        (match?.all_odds || []).forEach((odd) => {
            if (odd.odd_1 !== null && odd.odd_1 > best.odd_1) best.odd_1 = odd.odd_1;
            if (odd.odd_x !== null && odd.odd_x > best.odd_x) best.odd_x = odd.odd_x;
            if (odd.odd_2 !== null && odd.odd_2 > best.odd_2) best.odd_2 = odd.odd_2;
        });
        return best;
    }, [match?.all_odds]);

    // 2. Prava funkcija koja menja console.log
    const handleToggleBet = (bookie: string, selection: '1' | 'X' | '2', oddValue: number) => {
        // Proveravamo da li je OVAJ tačan tip u OVOJ kladionici već na tiketu
        const isAlreadyAdded = items.some(
            (item) => item.id === match.id && item.selection === selection && item.bookie === bookie
        );

        if (isAlreadyAdded) {
            // Ako je korisnik ponovo kliknuo na istu kvotu, sklanjamo je sa tiketa (toggle)
            removeItem(match.id);
        } else {
            // U suprotnom, dodajemo na tiket
            addItem({
                id: match.id,
                homeTeam: match.home_team,
                awayTeam: match.away_team,
                selection,
                oddValue,
                bookie,
                all_odds: match.all_odds,
            });
        }
    };

    const oddsList = match?.all_odds || [];

    return (
        <div className="rounded-md border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="w-[180px] sm:w-[250px] font-semibold text-slate-600 dark:text-slate-300">
                                Kladionica
                            </TableHead>
                            <TableHead className="text-center font-bold">1</TableHead>
                            <TableHead className="text-center font-bold">X</TableHead>
                            <TableHead className="text-center font-bold">2</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {oddsList.length > 0 ? (
                            oddsList.map((oddEntry) => {
                                // 3. Proveravamo da li je meč odigran u OVOJ kladionici
                                // Da bismo znali da li da "ofarbamo" dugme
                                const selectedInThisBookie = items.find(
                                    (item) => item.id === match.id && item.bookie === oddEntry.bookie_name
                                );

                                return (
                                    <TableRow key={oddEntry.bookie_name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">

                                        {/* KOLONA: KLADIONICA (Logo + Tekst) */}
                                        <TableCell className="font-medium capitalize text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                    <img
                                                        src={`/bookies/${oddEntry.bookie_name.toLowerCase()}.png`}
                                                        alt={oddEntry.bookie_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <span className="hidden text-xs font-bold text-slate-400 uppercase">
                                                        {oddEntry.bookie_name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="truncate">{oddEntry.bookie_name}</span>
                                            </div>
                                        </TableCell>

                                        {/* KOLONA: 1 */}
                                        <TableCell className="text-center p-2">
                                            <OddButton
                                                odd={oddEntry.odd_1}
                                                isBest={oddEntry.odd_1 === bestOdds.odd_1}
                                                isSelected={selectedInThisBookie?.selection === '1'}
                                                onClick={() => oddEntry.odd_1 && handleToggleBet(oddEntry.bookie_name, '1', oddEntry.odd_1)}
                                            />
                                        </TableCell>

                                        {/* KOLONA: X */}
                                        <TableCell className="text-center p-2">
                                            <OddButton
                                                odd={oddEntry.odd_x}
                                                isBest={oddEntry.odd_x === bestOdds.odd_x}
                                                isSelected={selectedInThisBookie?.selection === 'X'}
                                                onClick={() => oddEntry.odd_x && handleToggleBet(oddEntry.bookie_name, 'X', oddEntry.odd_x)}
                                            />
                                        </TableCell>

                                        {/* KOLONA: 2 */}
                                        <TableCell className="text-center p-2">
                                            <OddButton
                                                odd={oddEntry.odd_2}
                                                isBest={oddEntry.odd_2 === bestOdds.odd_2}
                                                isSelected={selectedInThisBookie?.selection === '2'}
                                                onClick={() => oddEntry.odd_2 && handleToggleBet(oddEntry.bookie_name, '2', oddEntry.odd_2)}
                                            />
                                        </TableCell>

                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Trenutno nema dostupnih kvota za ovaj meč.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// Pod-komponenta za dizajn samog dugmeta (Prima isSelected prop)
const OddButton = ({ odd, isBest, isSelected, onClick }: { odd: number | null; isBest: boolean; isSelected: boolean; onClick: () => void }) => {
    if (odd === null) return <span className="text-muted-foreground/50 px-4 py-2">-</span>;

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-16 sm:w-20 rounded-md px-2 py-2 text-sm font-bold tabular-nums transition-all duration-200 active:scale-95',
                isSelected
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : isBest
                        ? 'bg-best-odds-green/15 text-best-odds-green border border-best-odds-green/30 hover:bg-best-odds-green/25 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
        >
            {odd.toFixed(2)}
        </button>
    );
};