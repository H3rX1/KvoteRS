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

// Pretpostavljena putanja do tvog supabase.ts fajla. 
// Prilagodi je ako se nalazi u drugom folderu (npr. '@/lib/supabase').
import { getMatchesWithGroupedOdds, type MatchWithOdds } from '@/lib/supabase';

// Komponenta sada mora biti async jer dohvatamo podatke sa servera
export default async function Home() {
  // Povlačimo podatke direktno iz Supabase-a
  const matches = await getMatchesWithGroupedOdds();

  // Izvlačimo jedinstvene sportove iz dobijenih mečeva
  const sportsCountMap = matches.reduce((acc: Record<string, number>, match: MatchWithOdds) => {
    if (match.sport) {
      acc[match.sport] = (acc[match.sport] || 0) + 1;
    }
    return acc;
  }, {});

  const sportsWithCounts = Object.entries(sportsCountMap).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header sports={sportsWithCounts} />
      <div className="grid flex-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
        <LeftSidebar sports={sportsWithCounts} />
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
            <div className="grid gap-6">
              {matches.map((match: MatchWithOdds) => (
                // Koristimo match.id pošto je to naziv polja u novom interfejsu
                // Napomena: Možda ćeš morati da ažuriraš i MatchCard komponentu
                // da prima novi `MatchWithOdds` tip umesto starog `Match` tipa.
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