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
import Link from 'next/link'; // Dodat Link

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

// Funkcija za generisanje SEO-friendly URL-a
function generateMatchUrl(match: MatchWithOdds) {
  // Pretvara "Crvena Zvezda" u "crvena-zvezda"
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const homeSlug = slugify(match.home_team);
  const awaySlug = slugify(match.away_team);
  const sportSlug = slugify(match.sport || 'sport');

  // Format: /fudbal/match/crvena-zvezda-partizan-s_12345
  return `/${sportSlug}/match/${homeSlug}-${awaySlug}-${match.id}`;
}

export default function MatchCard({ match }: MatchCardProps) {
  const bestOdds = getBestOdds(match);
  const sportSlug = match.sport ? match.sport.toLowerCase() : 'sport';
  const matchUrl = `/${sportSlug}/match/${match.slug}`;

  const displayedOdds = (() => {
    const selectedBookies: typeof match.all_odds = [];
    const seenNames = new Set<string>();

    const addBestBookie = (key: 'odd_1' | 'odd_x' | 'odd_2') => {
      const bestBookie = match.all_odds.find(
        (o) => o[key] !== null && o[key] === bestOdds[key]
      );
      if (bestBookie && !seenNames.has(bestBookie.bookie_name)) {
        selectedBookies.push(bestBookie);
        seenNames.add(bestBookie.bookie_name);
      }
    };

    addBestBookie('odd_1');
    addBestBookie('odd_x');
    addBestBookie('odd_2');

    for (const odd of match.all_odds) {
      if (selectedBookies.length >= 3) break;
      if (!seenNames.has(odd.bookie_name)) {
        selectedBookies.push(odd);
        seenNames.add(odd.bookie_name);
      }
    }

    return selectedBookies.slice(0, 3);
  })();

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-foreground hover:text-primary transition-colors">
            {/* Dodat Link oko imena timova */}
            <Link href={matchUrl}>
              {match.home_team} vs {match.away_team}
            </Link>
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
                <TableHead className="w-[120px] sm:w-[150px]">Bookmaker</TableHead>
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
                    <OddDisplay odd={oddEntry.odd_1} isBest={oddEntry.odd_1 !== null && oddEntry.odd_1 === bestOdds.odd_1} />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay odd={oddEntry.odd_x} isBest={oddEntry.odd_x !== null && oddEntry.odd_x === bestOdds.odd_x} />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay odd={oddEntry.odd_2} isBest={oddEntry.odd_2 !== null && oddEntry.odd_2 === bestOdds.odd_2} />
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
        isBest ? 'bg-best-odds-green/10 text-best-odds-green' : 'text-foreground/80'
      )}
    >
      {odd.toFixed(2)}
    </div>
  );
};