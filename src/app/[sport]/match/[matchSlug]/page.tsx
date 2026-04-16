export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronRight, Home, CalendarDays, Trophy } from 'lucide-react';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import OddsTableClient from '@/components/odds-table';
import BetSlip from '@/components/bet-slip';
import BetSlipMobile from '@/components/bet-slip-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

import {
    getMatchWithAllOddsBySlug,
    getMatchesWithGroupedOdds,
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

interface MatchPageProps {
    params: Promise<{ sport: string; matchSlug: string }>;
}

// Pomoćna funkcija koja sigurno kreira čist slug u novom formatu {drzava}-{liga}
function createCleanLeagueSlug(leagueName: string): string {
    // Sada NE sečemo string kod znaka " - ", već ceo string (i državu i ligu) pretvaramo u slug
    return leagueName
        .toLowerCase()
        // Zameni specifična naša slova
        .replace(/š/g, 's').replace(/đ/g, 'dj').replace(/ž/g, 'z').replace(/č/g, 'c').replace(/ć/g, 'c')
        // Ukloni sve što nije slovo ili broj (ovo će pretvoriti i onaj razmak-crtica-razmak u običnu crticu)
        .replace(/[^a-z0-9]+/g, '-')
        // Ukloni crtice sa početka i kraja
        .replace(/(^-|-$)+/g, '');
}

export default async function MatchPage({ params }: MatchPageProps) {
    const resolvedParams = await params;
    const { sport, matchSlug } = resolvedParams;

    const match = await getMatchWithAllOddsBySlug(matchSlug);

    if (!match) {
        notFound();
    }

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

    // Pametno generisanje sluga
    let correctLeagueSlug = createCleanLeagueSlug(match.league);

    // I dalje pokušavamo da nađemo 100% tačan slug iz baze kao prvi izbor
    for (const country of countriesData) {
        const foundLeague = country.leagues?.find((l) => l.name === match.league);
        if (foundLeague && foundLeague.slug) {
            correctLeagueSlug = foundLeague.slug;
            break;
        }
    }

    const matchDate = new Date(match.commence_time * 1000);

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            <Header sports={sportsWithCounts} />

            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_auto]">

                <LeftSidebar sports={sportsWithCounts} />

                <main className="flex-1 min-w-0 bg-slate-50/30 dark:bg-background/50 overflow-x-hidden">
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">

                            <div className="max-w-5xl mx-auto space-y-6 w-full min-w-0">

                                {/* BREADCRUMBS */}
                                <nav className="flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden w-full">
                                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 shrink-0">
                                        <Home className="w-4 h-4" />
                                        <span className="hidden sm:inline">Početna</span>
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />

                                    <Link href={`/${sport}`} className="hover:text-primary transition-colors capitalize shrink-0">
                                        {sport.replace(/-/g, ' ')}
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />

                                    <Link
                                        href={`/${sport}/leagues/${correctLeagueSlug}`}
                                        className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[250px]"
                                    >
                                        {match.league}
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />

                                    <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[300px]">
                                        {match.home_team} vs {match.away_team}
                                    </span>
                                </nav>

                                {/* ZAGLAVLJE MEČA (Hero sekcija) */}
                                <Card className="overflow-hidden w-full min-w-0 border-border/60 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                                    <CardContent className="p-4 sm:p-8 w-full min-w-0">
                                        <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 w-full min-w-0">

                                            {/* Datum i Liga */}
                                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground font-medium w-full min-w-0">
                                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full max-w-full">
                                                    <Trophy className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="truncate">{match.league}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full shrink-0">
                                                    <CalendarDays className="w-4 h-4" />
                                                    {format(matchDate, 'dd. MMMM yyyy. • HH:mm')}
                                                </div>
                                            </div>

                                            {/* Timovi (Imena) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center w-full gap-2 sm:gap-6 min-w-0">
                                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-center sm:text-right break-words hyphens-auto tracking-tight w-full min-w-0">
                                                    {match.home_team}
                                                </h2>
                                                <div className="text-slate-400 font-semibold text-lg sm:text-xl px-2 sm:px-4 text-center shrink-0">
                                                    VS
                                                </div>
                                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-center sm:text-left break-words hyphens-auto tracking-tight w-full min-w-0">
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

                                    <div className="w-full min-w-0 overflow-x-hidden rounded-md">
                                        <OddsTableClient match={match} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </main>

                {/* DESNI SIDEBAR: BET SLIP */}
                <BetSlip />
                <BetSlipMobile />
            </div>
        </div>
    );
}