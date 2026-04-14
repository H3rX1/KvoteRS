export const dynamic = 'force-dynamic';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MatchCard from '@/components/match-card';
import BetSlip from '@/components/bet-slip';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    getMatchesWithGroupedOdds,
    getMatchesWithGroupedOddsByLeague,
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

// Parametri dolaze iz novog URL formata umesto iz searchParams
interface LeaguePageProps {
    params: Promise<{ sport: string; leagueSlug: string }>;
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    // 1. Otpakujemo parametre URL-a
    const resolvedParams = await params;
    const { leagueSlug } = resolvedParams;

    // 2. Povlačimo podatke (paralelno za brzinu)
    // - matches: Lista mečeva samo za izabranu ligu (koje renderujemo)
    // - allMatches: Svi mečevi ukupno (koje koristimo da prebrojimo SVE sportove za sidebar)
    // - countriesData: Podaci za sidebar hijerarhiju
    const [matches, allMatches, countriesData] = await Promise.all([
        getMatchesWithGroupedOddsByLeague(leagueSlug),
        getMatchesWithGroupedOdds(),
        getActiveLeaguesGroupedByCountry()
    ]);

    // 3. Izvlačimo jedinstvene sportove iz SVIH mečeva da bi Sidebar ostao pun!
    const sportsCountMap = allMatches.reduce((acc: Record<string, number>, match: MatchWithOdds) => {
        if (match.sport) {
            acc[match.sport] = (acc[match.sport] || 0) + 1;
        }
        return acc;
    }, {});

    // 4. Mapiramo sportove i ubacujemo podatke o državama
    const sportsWithCounts = Object.entries(sportsCountMap).map(([name, count]) => ({
        name,
        count,
        countries: countriesData
    }));

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            <Header sports={sportsWithCounts} currentLeague={leagueSlug} />

            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_auto]">

                <LeftSidebar sports={sportsWithCounts} currentLeague={leagueSlug} />

                <main className="flex-1 min-w-0">
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">
                            <div className="grid gap-6 w-full min-w-0">

                                {/* Ako ima mečeva, crtamo ih */}
                                {matches.length > 0 ? (
                                    matches.map((match: MatchWithOdds) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-border/50">
                                        Trenutno nema dostupnih mečeva za ovu ligu.
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