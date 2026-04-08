export const dynamic = 'force-dynamic';
import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MatchCard from '@/components/match-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Prilagodi putanju ako se nalazi u drugom folderu (npr. '@/lib/supabase').
import {
  getMatchesWithGroupedOdds,
  getMatchesWithGroupedOddsByLeague, // <-- Uvozimo novu funkciju
  getActiveLeaguesGroupedByCountry,
  type MatchWithOdds
} from '@/lib/supabase';

// 1. Dodajemo interfejs da bismo mogli da čitamo URL parametre (Next.js Server Component)
interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// 2. Dodajemo searchParams kao argument
export default async function Home({ searchParams }: HomeProps) {

  // Čitamo slug lige iz URL-a (biće undefined na početnoj strani)
  const leagueSlug = searchParams.league as string | undefined;

  // 3. Dinamički biramo koju funkciju zovemo na osnovu toga da li imamo slug
  const fetchMatches = leagueSlug
    ? getMatchesWithGroupedOddsByLeague(leagueSlug)
    : getMatchesWithGroupedOdds();

  // Povlačimo podatke paralelno za bolje performanse
  const [matches, countriesData] = await Promise.all([
    fetchMatches, // <-- Ovde se izvršava odabrana funkcija
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
      <Header sports={sportsWithCounts} />

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_320px]">

        <LeftSidebar sports={sportsWithCounts} />

        <main className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
            <div className="grid gap-6">
              {/* Dodali smo proveru ako je niz prazan da pokaže poruku */}
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

        <aside className="hidden xl:block border-l border-border">
          <div className="sticky top-[100px] p-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg uppercase text-primary">
                  Bet Slip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mt-4 text-center text-muted-foreground">
                  Your bet slip is empty.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

      </div>
    </div>
  );
}