'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Activity, Menu } from 'lucide-react';

// Import the unified SidebarContent and Type from left-sidebar
import { SidebarContent, type SportWithCount } from './left-sidebar';

interface HeaderProps {
  sports: SportWithCount[];
}

export default function Header({ sports }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">

        {/* Mobile Button Trigger */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Toggle navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            {/* SheetContent wrapping the unified SidebarContent */}
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border text-left">
                <SheetTitle className="flex items-center gap-2 text-muted-foreground">
                  <Activity size={20} />
                  <span className="text-sm font-semibold uppercase tracking-wider">Sportovi</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Reusing the exact same SidebarContent. Passing onLinkClick to close Sheet on selection */}
                <SidebarContent sports={sports} onLinkClick={() => setIsOpen(false)} />
              </div>
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