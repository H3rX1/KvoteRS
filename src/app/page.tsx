export const dynamic = 'force-dynamic';
import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MatchCard from '@/components/match-card';
import BetSlip from '@/components/bet-slip'; // <-- Uvozimo komponentu
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  getMatchesWithGroupedOdds,
  getMatchesWithGroupedOddsByLeague,
  getActiveLeaguesGroupedByCountry,
  type MatchWithOdds
} from '@/lib/supabase';

// 1. IZMENA: U Next.js 15, searchParams je Promise
interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 2. Dodajemo searchParams kao argument
export default async function Home({ searchParams }: HomeProps) {

  // 3. IZMENA: Moramo da "otpakujemo" Promise koristeći await
  const resolvedParams = await searchParams;

  // Tek sada možemo bezbedno da pročitamo ligu
  const leagueSlug = resolvedParams.league as string | undefined;

  // Dinamički biramo koju funkciju zovemo na osnovu toga da li imamo slug
  const fetchMatches = leagueSlug
    ? getMatchesWithGroupedOddsByLeague(leagueSlug)
    : getMatchesWithGroupedOdds();

  // Povlačimo podatke paralelno za bolje performanse
  const [matches, countriesData] = await Promise.all([
    fetchMatches,
    getActiveLeaguesGroupedByCountry()
  ]);

  // Izvlačimo jedinstvene sportove iz dobijenih mečeva
  const sportsCountMap = matches.reduce((acc: Record<string, number>, match: MatchWithOdds) => {
    if (match.sport) {
      acc[match.sport] = (acc[match.sport] || 0) + 1;
    }
    return acc;
  }, {});

  // Mapiramo sportove i ubacujemo podatke o državama
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
          <ScrollArea className="h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
            <div className="grid gap-6">
              {matches.length > 0 ? (
                matches.map((match: MatchWithOdds) => (
                  <MatchCard key={match.id} match={match as any} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Trenutno nema dostupnih mečeva za ovu ligu.
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        {/* Ubacili smo komponentu ovde i obrisali hardkodovani deo */}
        <BetSlip />

      </div>
    </div>
  );
}