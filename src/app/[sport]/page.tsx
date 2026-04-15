export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MatchCard from '@/components/match-card';
import BetSlip from '@/components/bet-slip';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    getMatchesWithGroupedOdds,
    getMatchesWithGroupedOddsBySport,
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

interface SportPageProps {
    params: Promise<{ sport: string }>;
}

export default async function SportPage({ params }: SportPageProps) {
    const resolvedParams = await params;
    const { sport } = resolvedParams;

    const [matches, allMatches, countriesData] = await Promise.all([
        getMatchesWithGroupedOddsBySport(sport.replace(/-/g, ' ')), // Regex /-/g za reči sa više crtica
        getMatchesWithGroupedOdds(),
        getActiveLeaguesGroupedByCountry()
    ]);

    const sportsCountMap = allMatches.reduce((acc: Record<string, number>, match: MatchWithOdds) => {
        if (match.sport) acc[match.sport] = (acc[match.sport] || 0) + 1;
        return acc;
    }, {});

    const sportsWithCounts = Object.entries(sportsCountMap).map(([name, count]) => ({
        name, count, countries: countriesData
    }));

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            <Header sports={sportsWithCounts} />

            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_auto]">
                <LeftSidebar sports={sportsWithCounts} />

                <main className="flex-1 min-w-0">
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">

                            {/* BREADCRUMBS */}
                            <nav className="flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
                                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Home className="w-4 h-4" />
                                    <span className="hidden sm:inline">Početna</span>
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                <span className="font-medium text-foreground capitalize truncate">
                                    {sport.replace(/-/g, ' ')}
                                </span>
                            </nav>

                            {/* HERO BEDŽ SPORTA */}
                            <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border/50">
                                <span className="text-2xl">🏆</span>
                                <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                                    Svi mečevi - {sport.replace(/-/g, ' ')}
                                </h2>
                            </div>

                            <div className="grid gap-6 w-full min-w-0">
                                {matches.length > 0 ? (
                                    matches.map((match: MatchWithOdds) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-border/50">
                                        Trenutno nema dostupnih mečeva za ovaj sport.
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </main>
                <BetSlip />
            </div>
        </div>
    );
}