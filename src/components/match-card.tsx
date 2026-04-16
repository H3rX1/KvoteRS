'use client';

import React from 'react';
import type { MatchWithOdds } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- Dodato za rutiranje klikom na background
import { ChevronRight } from 'lucide-react'; // <-- Dodato za ikonicu u footeru
import { useBetSlipStore } from '@/store/use-bet-slip';

interface MatchCardProps {
  match: MatchWithOdds;
}

function getBestOdds(match: MatchWithOdds) {
  const bestOdds = { odd_1: 0, odd_x: 0, odd_2: 0 };

  match.all_odds.forEach((odd) => {
    if (odd.odd_1 !== null && odd.odd_1 > bestOdds.odd_1) bestOdds.odd_1 = odd.odd_1;
    if (odd.odd_x !== null && odd.odd_x > bestOdds.odd_x) bestOdds.odd_x = odd.odd_x;
    if (odd.odd_2 !== null && odd.odd_2 > bestOdds.odd_2) bestOdds.odd_2 = odd.odd_2;
  });

  return bestOdds;
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter(); // <-- Inicijalizujemo router
  const bestOdds = getBestOdds(match);
  const sportSlug = match.sport ? match.sport.toLowerCase() : 'sport';

  const matchSlug = match.slug || `${match.home_team}-${match.away_team}-${match.id}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const matchUrl = `/${sportSlug}/match/${matchSlug}`;

  const { items, addItem, removeItem } = useBetSlipStore();

  const twoWaySports = ['tenis', 'odbojka', 'e-sports', 'stoni tenis', 'pikado', 'snuker'];
  const isTwoWaySport = twoWaySports.includes(sportSlug);

  const displayedOdds = (() => {
    const selectedBookies: typeof match.all_odds = [];
    const seenNames = new Set<string>();

    const addBestBookie = (key: 'odd_1' | 'odd_x' | 'odd_2') => {
      const bestBookie = match.all_odds.find(
        (o) => o[key] !== null && o[key] === bestOdds[key]
      );
      if (bestBookie && !seenNames.has(bestBookie.bookie_name)) {
        selectedBookies.push(bestBookie);
        seenNames.add(bestBookie.bookie_name);
      }
    };

    addBestBookie('odd_1');
    if (!isTwoWaySport) addBestBookie('odd_x');
    addBestBookie('odd_2');

    for (const odd of match.all_odds) {
      if (selectedBookies.length >= 3) break;
      if (!seenNames.has(odd.bookie_name)) {
        selectedBookies.push(odd);
        seenNames.add(odd.bookie_name);
      }
    }

    return selectedBookies.slice(0, 3);
  })();

  const handleToggleBet = (bookie: string, selection: '1' | 'X' | '2', oddValue: number) => {
    const isAlreadyAdded = items.some(
      (item) => item.id === match.id && item.selection === selection && item.bookie === bookie
    );

    if (isAlreadyAdded) {
      removeItem(match.id);
    } else {
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

  return (
    <Card className="overflow-hidden border-border/50 transition-shadow hover:shadow-md flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-foreground hover:text-primary transition-colors">
            <Link href={matchUrl}>
              {match.home_team} <span className="text-muted-foreground font-normal text-lg mx-1">vs</span> {match.away_team}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
            <span>🕒</span>
            <span>{format(new Date(match.commence_time * 1000), 'MMM d, HH:mm')}</span>
          </div>
        </div>
        <CardDescription className="font-medium text-primary/80">
          {match.league} <span className="mx-1">•</span> <span className="capitalize">{match.sport}</span>
        </CardDescription>
      </CardHeader>

      {/* KLIKABILAN BACKGROUND: onClick event na CardContent preusmerava na matchUrl */}
      <CardContent
        className="p-0 sm:p-4 sm:pt-0 cursor-pointer group"
        onClick={() => router.push(matchUrl)}
      >
        <div className="overflow-x-auto rounded-md sm:border sm:border-border/50 transition-colors group-hover:border-primary/20">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b-border/50">
                <TableHead className="w-[120px] sm:w-[150px] font-semibold text-slate-500">Kladionica</TableHead>
                <TableHead className="text-center font-bold text-slate-500">1</TableHead>
                {!isTwoWaySport && <TableHead className="text-center font-bold text-slate-500">X</TableHead>}
                <TableHead className="text-center font-bold text-slate-500">2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedOdds.map((oddEntry) => {
                const selectedInThisBookie = items.find(
                  (item) => item.id === match.id && item.bookie === oddEntry.bookie_name
                );

                return (
                  // Uklonili smo hover background sa reda da bi se video hover efekat celog kontejnera
                  <TableRow key={oddEntry.bookie_name} className="border-b-border/50 hover:bg-transparent">
                    <TableCell className="font-semibold capitalize text-foreground text-xs sm:text-sm">
                      {oddEntry.bookie_name}
                    </TableCell>

                    <TableCell className="text-center p-1 sm:p-2">
                      <OddButton
                        odd={oddEntry.odd_1}
                        isBest={oddEntry.odd_1 !== null && oddEntry.odd_1 === bestOdds.odd_1}
                        isSelected={selectedInThisBookie?.selection === '1'}
                        onClick={() => oddEntry.odd_1 && handleToggleBet(oddEntry.bookie_name, '1', oddEntry.odd_1)}
                      />
                    </TableCell>

                    {!isTwoWaySport && (
                      <TableCell className="text-center p-1 sm:p-2">
                        <OddButton
                          odd={oddEntry.odd_x}
                          isBest={oddEntry.odd_x !== null && oddEntry.odd_x === bestOdds.odd_x}
                          isSelected={selectedInThisBookie?.selection === 'X'}
                          onClick={() => oddEntry.odd_x && handleToggleBet(oddEntry.bookie_name, 'X', oddEntry.odd_x)}
                        />
                      </TableCell>
                    )}

                    <TableCell className="text-center p-1 sm:p-2">
                      <OddButton
                        odd={oddEntry.odd_2}
                        isBest={oddEntry.odd_2 !== null && oddEntry.odd_2 === bestOdds.odd_2}
                        isSelected={selectedInThisBookie?.selection === '2'}
                        onClick={() => oddEntry.odd_2 && handleToggleBet(oddEntry.bookie_name, '2', oddEntry.odd_2)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* FOOTER - OSTALE KVOTE */}
      <div className="mt-auto border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/30 p-2 sm:p-3">
        <Link
          href={matchUrl}
          className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold text-primary transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-[0.98]"
        >
          OSTALE KVOTE <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </Card>
  );
}

const OddButton = ({ odd, isBest, isSelected, onClick }: { odd: number | null; isBest: boolean; isSelected: boolean; onClick: () => void }) => {
  if (odd === null) return <span className="text-muted-foreground/50">-</span>;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); // <-- OVO JE KLJUČNO! Sprečava da klik na kvotu preusmeri korisnika na drugu stranicu.
        onClick();
      }}
      className={cn(
        'w-12 sm:w-16 rounded-md px-1 sm:px-2 py-1.5 text-xs sm:text-sm font-bold tabular-nums transition-all duration-200 active:scale-95',
        isSelected
          ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary ring-offset-1 ring-offset-background'
          : isBest
            ? 'bg-best-odds-green/15 text-best-odds-green border border-best-odds-green/30 hover:bg-best-odds-green/25 shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      )}
    >
      {odd.toFixed(2)}
    </button>
  );
};