import { matches } from '@/lib/data';
import type { Match } from '@/types';
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

export default function Home() {
  const sports = [...new Set(matches.map((match) => match.sport))];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header sports={sports} />
      <div className="grid flex-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
        <LeftSidebar sports={sports} />
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-80px)] p-4 md:p-6 lg:p-8">
            <div className="grid gap-6">
              {matches.map((match: Match) => (
                <MatchCard key={match.matchId} match={match} />
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
