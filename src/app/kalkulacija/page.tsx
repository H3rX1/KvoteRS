export const dynamic = 'force-dynamic';

import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import BetSlip from '@/components/bet-slip';
import BetSlipMobile from '@/components/bet-slip-mobile';
import CalculatorClient from '@/components/calculator-client'; // <-- Uvozimo UI koji smo upravo napravili
import { ScrollArea } from '@/components/ui/scroll-area';

import {
    getMatchesWithGroupedOdds,
    getActiveLeaguesGroupedByCountry,
    type MatchWithOdds
} from '@/lib/supabase';

export default async function KalkulacijaPage() {
    // Povlačimo podatke za sidebar meni (kako bi layout ostao konstantan)
    const [matches, countriesData] = await Promise.all([
        getMatchesWithGroupedOdds(),
        getActiveLeaguesGroupedByCountry()
    ]);

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

                {/* LEVI SIDEBAR */}
                <LeftSidebar sports={sportsWithCounts} />

                {/* SREDINA - KALKULATOR */}
                <main className="flex-1 min-w-0 bg-slate-50/30 dark:bg-background/50 overflow-x-hidden">
                    <ScrollArea className="h-[calc(100vh-80px)] w-full">
                        <div className="p-4 md:p-6 lg:p-8 w-full min-w-0">
                            {/* Ovdje se nalazi naš klijentski kod za kalkulaciju */}
                            <CalculatorClient />
                        </div>
                    </ScrollArea>
                </main>

                {/* DESNI SIDEBAR - TIKET */}
                {/* Tiket nam je ovde uvek vidljiv jer smo se tako dogovorili (opcija 5) */}
                <BetSlip />
                <BetSlipMobile />
            </div>
        </div>
    );
}