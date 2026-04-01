import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import LeftSidebarContent from './left-sidebar-content';
// Uvozimo novi tip koji smo napravili u left-sidebar.tsx
import type { SportWithCount } from './left-sidebar';

interface HeaderProps {
  sports: SportWithCount[];
}

export default function Header({ sports }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="text-2xl">☰</span>
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </SheetHeader>
              {/* Prosleđujemo ceo objekat sa imenom i brojem u mobilni meni */}
              <LeftSidebarContent sports={sports} />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">📈</span>
          <h1 className="font-headline text-2xl font-bold uppercase tracking-wider text-primary">
            KvoteRS
          </h1>
        </div>
      </div>
    </header>
  );
}