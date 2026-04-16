'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Activity, Menu, Globe } from 'lucide-react';
import { SidebarContent, type SportWithCount } from './left-sidebar';

// Uvozimo komponentu za pretragu (Prilagodi putanju ako si joj dao drugačije ime)
import GlobalSearch from '@/components/search-bar-card';

interface HeaderProps {
  sports: SportWithCount[];
  currentLeague?: string;
}

export default function Header({ sports, currentLeague }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 sm:h-20 items-center justify-between border-b border-border bg-background/80 px-2 sm:px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center w-full justify-between gap-2 sm:gap-4">

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Mobile Button Trigger */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b border-border text-left">
                  <SheetTitle className="flex items-center gap-2 text-muted-foreground">
                    <Activity size={20} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Sportovi</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <SidebarContent sports={sports} onLinkClick={() => setIsOpen(false)} currentLeague={currentLeague} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-80">
            <span className="text-2xl sm:text-3xl">📈</span>
            <h1 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-wider text-primary hidden sm:block">
              KvoteRS
            </h1>
          </Link>
        </div>

        {/* UBACENA GLOBALNA PRETRAGA (Zauzima preostali prostor u sredini) */}
        <div className="flex-1 flex justify-center max-w-2xl">
          <GlobalSearch />
        </div>

        {/* ISPRAVLJENO: Korišćenje 'asChild' kako bi izbegli stavljanje <button> u <a> tag */}
        <Button asChild variant="secondary" size="sm" className="h-9 px-2 sm:px-4 font-semibold tracking-wide shrink-0">
          <Link href="/svi-mecevi">
            <Globe className="w-4 h-4 sm:mr-2 shrink-0" />
            <span className="hidden sm:inline">SVI MEČEVI</span>
          </Link>
        </Button>

      </div>
    </header>
  );
}