'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, CalendarDays, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { searchMatches } from '@/lib/supabase'; // Tvoja nova supabase funkcija

// Tip za rezultat kako ne bismo uvozili sve kvote (brže)
type SearchResult = {
    id: string;
    home_team: string;
    away_team: string;
    sport: string;
    league: string;
    commence_time: number;
    slug: string | null;
};

export default function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Zatvaranje dropdowna klikom izvan njega
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce Logika (Sprečava spamovanje baze pri svakom otkucanom slovu)
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const data = await searchMatches(query.trim());
            setResults(data as SearchResult[]);
            setIsLoading(false);
            setIsOpen(true);
        }, 400); // Čeka 400ms pre slanja upita u bazu

        return () => clearTimeout(timer); // Prekida prethodni tajmer ako korisnik nastavi da kuca
    }, [query]);

    // Formatiranje URL-a
    const handleSelectMatch = (match: SearchResult) => {
        const sportSlug = match.sport ? match.sport.toLowerCase() : 'sport';
        const matchSlug = match.slug || `${match.home_team}-${match.away_team}-${match.id}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        setIsOpen(false);
        setQuery('');
        router.push(`/${sportSlug}/match/${matchSlug}`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md mx-4 hidden md:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    placeholder="Pretraži mečeve, timove..."
                    className="w-full pl-9 pr-10 bg-slate-100 dark:bg-slate-800/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-colors"
                />

                {/* Clear dugme ili Loader */}
                {isLoading ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                ) : query.length > 0 ? (
                    <button
                        onClick={() => { setQuery(''); setIsOpen(false); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : null}
            </div>

            {/* DROPDOWN REZULTATI */}
            {isOpen && query.length >= 2 && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <ScrollArea className="max-h-[400px]">
                        {results.length > 0 ? (
                            <div className="flex flex-col">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50">
                                    Pronađeni Mečevi ({results.length})
                                </div>
                                {results.map((match) => (
                                    <button
                                        key={match.id}
                                        onClick={() => handleSelectMatch(match)}
                                        className="flex flex-col text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border/50 last:border-0 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1 pr-2">
                                                {match.home_team} vs {match.away_team}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                                            <div className="flex items-center gap-1">
                                                <Trophy className="w-3 h-3 text-primary/70" />
                                                <span className="truncate max-w-[120px]">{match.league}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" />
                                                <span>{format(new Date(match.commence_time * 1000), 'dd.MM • HH:mm')}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    Nema pronađenih mečeva za "{query}"
                                </div>
                            )
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}