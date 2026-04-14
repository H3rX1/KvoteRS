export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronRight, Home, CalendarDays, Trophy } from 'lucide-react';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import OddsTableClient from '@/components/odds-table';
import BetSlip from '@/components/bet-slip'; // <-- Uvezli smo novu interaktivnu komponentu
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

import {
    getMatchWithAllOddsBySlug,
    getMatchesWithGroupedOdds, // Koristimo privremeno za generisanje sidebara
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

// U Next.js 15 parametri iz URL-a (dinamičke rute) dolaze kao Promise
interface MatchPageProps {
    params: Promise<{ sport: string; matchSlug: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
    // 1. Await-ujemo parametre iz URL-a
    const resolvedParams = await params;
    const { sport, matchSlug } = resolvedParams;

    // 2. Povlačimo meč po njegovom slugu
    const match = await getMatchWithAllOddsBySlug(matchSlug);

    // Ako meč ne postoji (ili je loš URL), Next.js prikazuje 404 stranicu
    if (!match) {
        notFound();
    }

    // 3. Povlačimo podatke za Sidebar (kako bi layout ostao netaknut)
    // U idealnom svetu ovde bi imali endpoint samo za "sports counts", ali za sada koristimo postojeći
    const [sidebarMatches, countriesData] = await Promise.all([
        getMatchesWithGroupedOdds(),
        getActiveLeaguesGroupedByCountry()
    ]);

    const sportsCountMap = sidebarMatches.reduce((acc: Record<string, number>, m: MatchWithOdds) => {
        if (m.sport) acc[m.sport] = (acc[m.sport] || 0) + 1;
        return acc;
    }, {});

    const sportsWithCounts = Object.entries(sportsCountMap).map(([name, count]) => ({
        name,
        count,
        countries: countriesData
    }));

    // Formatiranje datuma za zaglavlje
    const matchDate = new Date(match.commence_time * 1000);

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            {/* HEADER */}
            <Header sports={sportsWithCounts} />

            {/* GLAVNI GRID SA SIDEBAROVIMA */}
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_auto]">

                {/* LEVI SIDEBAR */}
                <LeftSidebar sports={sportsWithCounts} />

                {/* SREDINA: DETALJI MEČA */}
                <main className="flex-1 min-w-0 bg-slate-50/30 dark:bg-background/50">
                    {/* IZMENA: ScrollArea sada kontroliše samo veličinu, bez paddinga */}
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        {/* IZMENA: Padding je prebačen ovde. Dodato w-full i min-w-0 za sprečavanje probijanja layouta */}
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">

                            <div className="max-w-5xl mx-auto space-y-6 w-full min-w-0">
                                {/* BREADCRUMBS (Navigacija unazad) */}
                                <nav className="flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        <Home className="w-4 h-4" />
                                        <span className="hidden sm:inline">Početna</span>
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                    <span className="capitalize">{sport.replace('-', ' ')}</span>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                    <span className="truncate max-w-[150px] sm:max-w-none">{match.league}</span>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                    <span className="font-medium text-foreground truncate">
                                        {match.home_team} vs {match.away_team}
                                    </span>
                                </nav>

                                {/* ZAGLAVLJE MEČA (Hero sekcija) */}
                                {/* IZMENA: Dodato w-full i min-w-0 na karticu */}
                                <Card className="overflow-hidden w-full min-w-0 border-border/60 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                                    {/* IZMENA: Dodato w-full i min-w-0 na CardContent */}
                                    <CardContent className="p-6 sm:p-8 w-full min-w-0">
                                        {/* IZMENA: Sprečavanje Flexbox blowout efekta pomoću w-full i min-w-0 */}
                                        <div className="flex flex-col items-center justify-center text-center space-y-6 w-full min-w-0">
                                            {/* Datum i Liga */}
                                            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                    <Trophy className="w-4 h-4 text-primary" />
                                                    {match.league}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                    <CalendarDays className="w-4 h-4" />
                                                    {format(matchDate, 'dd. MMMM yyyy. • HH:mm')}
                                                </div>
                                            </div>

                                            {/* Timovi (Imena) */}
                                            {/* IZMENA: Kaskadno min-w-0 sve do samog teksta */}
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center w-full gap-4 sm:gap-6 min-w-0">
                                                <h2 className="text-3xl sm:text-3xl md:text-4xl font-headline font-bold text-center sm:text-right break-words tracking-tight w-full min-w-0">
                                                    {match.home_team}
                                                </h2>
                                                <div className="text-slate-400 font-semibold text-lg sm:text-xl px-2 sm:px-4 text-center shrink-0">
                                                    VS
                                                </div>
                                                <h2 className="text-3xl sm:text-3xl md:text-4xl font-headline font-bold text-center sm:text-left break-words tracking-tight w-full min-w-0">
                                                    {match.away_team}
                                                </h2>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* TABELA SA KVOTAMA */}
                                <div className="space-y-4 pt-4 w-full min-w-0">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Uporedi Kvote
                                    </h3>

                                    {/* Pozivamo klijentsku komponentu za interaktivnu tabelu */}
                                    <OddsTableClient match={match} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </main>

                {/* DESNI SIDEBAR: BET SLIP */}
                <BetSlip />

            </div>
        </div>
    );
}