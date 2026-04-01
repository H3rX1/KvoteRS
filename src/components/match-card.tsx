import type { MatchWithOdds } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: MatchWithOdds;
}

function getBestOdds(match: MatchWithOdds) {
  const bestOdds = { odd_1: 0, odd_x: 0, odd_2: 0 };

  match.all_odds.forEach((odd) => {
    if (odd.odd_1 !== null && odd.odd_1 > bestOdds.odd_1) bestOdds.odd_1 = odd.odd_1;
    if (odd.odd_x !== null && odd.odd_x > bestOdds.odd_x) bestOdds.odd_x = odd.odd_x;
    if (odd.odd_2 !== null && odd.odd_2 > bestOdds.odd_2) bestOdds.odd_2 = odd.odd_2;
  });

  return bestOdds;
}

export default function MatchCard({ match }: MatchCardProps) {
  const bestOdds = getBestOdds(match);

  // Logika koja bira 3 kladionice tako da obavezno uključi one sa najboljim kvotama
  const displayedOdds = (() => {
    const selectedBookies: typeof match.all_odds = [];
    const seenNames = new Set<string>();

    // Funkcija za dodavanje kladionice ako ima najbolju kvotu za specifičan ishod
    const addBestBookie = (key: 'odd_1' | 'odd_x' | 'odd_2') => {
      const bestBookie = match.all_odds.find(
        (o) => o[key] !== null && o[key] === bestOdds[key]
      );
      if (bestBookie && !seenNames.has(bestBookie.bookie_name)) {
        selectedBookies.push(bestBookie);
        seenNames.add(bestBookie.bookie_name);
      }
    };

    // Pokušavamo da nađemo i dodamo pobednike za sva tri ishoda
    addBestBookie('odd_1');
    addBestBookie('odd_x');
    addBestBookie('odd_2');

    // Ukoliko nemamo 3 kladionice (npr. jedna kladionica ima najbolje kvote za više ishoda),
    // popunjavamo listu do 3 sa ostalim dostupnim kladionicama
    for (const odd of match.all_odds) {
      if (selectedBookies.length >= 3) break;
      if (!seenNames.has(odd.bookie_name)) {
        selectedBookies.push(odd);
        seenNames.add(odd.bookie_name);
      }
    }

    return selectedBookies.slice(0, 3); // Osiguravamo maksimum 3
  })();

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-foreground">
            {match.home_team} vs {match.away_team}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🕒</span>
            <span>{format(new Date(match.commence_time * 1000), 'MMM d, HH:mm')}</span>
          </div>
        </div>
        <CardDescription>
          {match.league} - {match.sport}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] sm:w-[150px]">
                  Bookmaker
                </TableHead>
                <TableHead className="text-center">1</TableHead>
                <TableHead className="text-center">X</TableHead>
                <TableHead className="text-center">2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedOdds.map((oddEntry) => (
                <TableRow key={oddEntry.bookie_name}>
                  <TableCell className="font-semibold capitalize text-foreground">
                    {oddEntry.bookie_name}
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={oddEntry.odd_1}
                      isBest={
                        oddEntry.odd_1 !== null &&
                        oddEntry.odd_1 === bestOdds.odd_1
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={oddEntry.odd_x}
                      isBest={
                        oddEntry.odd_x !== null &&
                        oddEntry.odd_x === bestOdds.odd_x
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={oddEntry.odd_2}
                      isBest={
                        oddEntry.odd_2 !== null &&
                        oddEntry.odd_2 === bestOdds.odd_2
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const OddDisplay = ({ odd, isBest }: { odd: number | null; isBest: boolean }) => {
  if (odd === null) return <span className="text-muted-foreground">-</span>;

  return (
    <div
      className={cn(
        'inline-block rounded-md px-2 py-1 text-sm font-bold tabular-nums transition-colors',
        isBest
          ? 'bg-best-odds-green/10 text-best-odds-green'
          : 'text-foreground/80'
      )}
    >
      {odd.toFixed(2)}
    </div>
  );
};