import { Button } from '@/components/ui/button';

interface LeftSidebarContentProps {
  sports: string[];
}

const sportIcons: { [key: string]: string } = {
  Football: '⚽️',
  Basketball: '🏀',
};

export default function LeftSidebarContent({
  sports,
}: LeftSidebarContentProps) {
  return (
    <nav className="flex flex-col gap-4">
      <h2 className="px-2 font-headline text-lg uppercase text-primary">
        Sports
      </h2>
      <div className="flex flex-col gap-1">
        {sports.map((sport) => (
          <Button
            key={sport}
            variant="ghost"
            className="justify-start gap-3 px-2"
          >
            <span className="w-5 text-center text-xl">
              {sportIcons[sport] || '🛡️'}
            </span>
            <span className="text-base">{sport}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
