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
  getLeaguesGroupedByCountry,
  type MatchWithOdds
} from '@/lib/supabase';

export default async function Home() {
  // Povlačimo podatke paralelno za bolje performanse
  const [matches, countriesData] = await Promise.all([
    getMatchesWithGroupedOdds(),
    getLeaguesGroupedByCountry()
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
    // Trenutno SQL funkcija vraća sve države bez filtriranja po sportu,
    // pa ih ovde prosleđujemo direktno. Ako u budućnosti budeš imao više sportova
    // u bazi (npr. košarka i fudbal), ovde ćeš moći da ih filtriraš.
    countries: countriesData
  }));

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <Header sports={sportsWithCounts} />

      {/* IZMENA: Dodat je grid-cols-1 za mobilni telefon kako bi grid pravilno funkcionisao pre lg breakpoint-a.
          Prva kolona na desktopu je fiksirana na 360px.
      */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[360px_1fr_320px]">

        <LeftSidebar sports={sportsWithCounts} />

        {/* IZMENA: min-w-0 je obavezno ovde da glavni sadržaj ne bi probio grid */}
        <main className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
            <div className="grid gap-6">
              {matches.map((match: MatchWithOdds) => (
                <MatchCard key={match.id} match={match as any} />
              ))}
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