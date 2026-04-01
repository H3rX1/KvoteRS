import { Button } from '@/components/ui/button';
import type { SportWithCount } from './left-sidebar';

interface LeftSidebarContentProps {
  // TS očekuje objekte, ali ćemo obezbediti kod u slučaju da stignu stringovi sa servera/roditelja
  sports: any[];
}

export default function LeftSidebarContent({ sports }: LeftSidebarContentProps) {
  // Pravimo siguran niz koji uvek ima 'name' i 'count', čak i ako stignu pogrešni podaci
  const safeSports = sports.map((sport) => {
    if (typeof sport === 'string') {
      return { name: sport, count: 0 };
    }
    return sport;
  });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mb-2 px-3 text-lg font-semibold tracking-tight text-foreground">
        Sportovi
      </h2>
      <nav className="flex flex-col space-y-1">
        {safeSports.map((sport, index) => {
          // Ako 'name' iz nekog razloga fali, koristimo index kao rezervni ključ da React ne prijavi grešku
          const uniqueKey = sport.name || `sport-fallback-${index}`;

          return (
            <Button
              key={uniqueKey}
              variant="ghost"
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
            >
              <span>{sport.name}</span>
              {/* Prikazujemo bedž samo ako je count veći od 0 ili validan */}
              {sport.count !== undefined && sport.count > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {sport.count}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}