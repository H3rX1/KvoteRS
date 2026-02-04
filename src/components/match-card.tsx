import type { Match } from '@/types';
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
  match: Match;
}

function getBestOdds(match: Match) {
  const oddsTypes = ['homeWin', 'draw', 'awayWin'] as const;
  const bestOdds: { [key in (typeof oddsTypes)[number]]?: number } = {};

  oddsTypes.forEach((type) => {
    const allOddsForType = Object.values(match.odds).map((o) => o[type]);
    if (allOddsForType.length > 0) {
      bestOdds[type] = Math.max(...allOddsForType);
    }
  });
  return bestOdds;
}

export default function MatchCard({ match }: MatchCardProps) {
  const bestOdds = getBestOdds(match);
  const bookmakers = Object.keys(match.odds);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-foreground">
            {match.teams.home} vs {match.teams.away}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🕒</span>
            <span>{format(new Date(match.time), 'MMM d, HH:mm')}</span>
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
              {bookmakers.map((bookmaker) => (
                <TableRow key={bookmaker}>
                  <TableCell className="font-semibold capitalize text-foreground">
                    {bookmaker}
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={match.odds[bookmaker].homeWin}
                      isBest={
                        match.odds[bookmaker].homeWin === bestOdds.homeWin
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={match.odds[bookmaker].draw}
                      isBest={match.odds[bookmaker].draw === bestOdds.draw}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <OddDisplay
                      odd={match.odds[bookmaker].awayWin}
                      isBest={
                        match.odds[bookmaker].awayWin === bestOdds.awayWin
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

const OddDisplay = ({ odd, isBest }: { odd: number; isBest: boolean }) => (
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
