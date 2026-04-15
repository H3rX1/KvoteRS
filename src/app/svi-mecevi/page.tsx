export const dynamic = 'force-dynamic';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MatchCard from '@/components/match-card';
import BetSlip from '@/components/bet-slip';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    getMatchesWithGroupedOdds,
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

export default async function SviMeceviPage() {
    // Povlačimo sve mečeve i države
    const [matches, countriesData] = await Promise.all([
        getMatchesWithGroupedOdds(),
        getActiveLeaguesGroupedByCountry()
    ]);

    // Računamo broj mečeva po sportu za sidebar
    const sportsCountMap = matches.reduce((acc: Record<string, number>, match: MatchWithOdds) => {
        if (match.sport) {
            acc[match.sport] = (acc[match.sport] || 0) + 1;
        }
        return acc;
    }, {});

    const sportsWithCounts = Object.entries(sportsCountMap).map(([name, count]) => ({
        name,
        count,
        countries: countriesData
    }));

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
            <Header sports={sportsWithCounts} />

            <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_auto]">
                <LeftSidebar sports={sportsWithCounts} />

                <main className="flex-1 min-w-0">
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">

                            {/* Dodali smo naslov da korisnik zna gde se nalazi */}
                            <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border/50">
                                <span className="text-2xl">🌍</span>
                                <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                                    Svi mečevi
                                </h2>
                            </div>

                            <div className="grid gap-6 w-full min-w-0">
                                {matches.length > 0 ? (
                                    matches.map((match: MatchWithOdds) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-border/50">
                                        Trenutno nema dostupnih mečeva.
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