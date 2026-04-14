'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Trophy, Activity, Globe } from 'lucide-react';
import Link from 'next/link';

export interface League {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  name: string;
  leagues: League[];
}

export interface SportWithCount {
  name: string;
  count: number;
  countries?: Country[];
  icon?: React.ReactNode;
}

// DODATO: currentLeague prop
interface SidebarContentProps {
  sports: SportWithCount[];
  onLinkClick?: () => void;
  currentLeague?: string;
}

// 1. REUSABLE CORE COMPONENT
export function SidebarContent({ sports, onLinkClick, currentLeague }: SidebarContentProps) {
  const [expandedSports, setExpandedSports] = useState<Record<string, boolean>>({});
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});

  // DODATO: Resetuj navigaciju kada se vratimo na "SVI MEČEVI" (nema currentLeague)
  useEffect(() => {
    if (!currentLeague) {
      setExpandedCountries({});
      // Ako želimo da fudbal uvek bude otvoren po defaultu kada se vratimo na početnu
      if (sports.length > 0) {
        setExpandedSports({ [sports[0].name]: true });
      } else {
        setExpandedSports({});
      }
    }
  }, [currentLeague, sports]);

  // IZMENJENO: Accordion logika (otvaranje jednog sporta zatvara druge i zaboravlja države)
  const toggleSport = (sportName: string) => {
    setExpandedSports((prev) => {
      // Ako je sport već otvoren, samo ga zatvori
      if (prev[sportName]) {
        return { ...prev, [sportName]: false };
      }
      // Ako otvaramo NOVI sport:
      else {
        setExpandedCountries({}); // Resetuj (zaboravi) otvorene države
        return { [sportName]: true }; // Otvori samo ovaj sport, zatvori ostale
      }
    });
  };

  const toggleCountry = (sportName: string, countryName: string) => {
    const key = `${sportName}-${countryName}`;
    setExpandedCountries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-1 w-full">
      {sports.map((sport) => {
        const isSportExpanded = !!expandedSports[sport.name];

        return (
          <div key={sport.name} className="flex flex-col">
            {/* --- Level 1: SPORT --- */}
            <button
              onClick={() => toggleSport(sport.name)}
              className={`flex items-center justify-between w-full p-2 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] ${isSportExpanded ? 'bg-slate-50 dark:bg-slate-800/50 font-medium' : 'text-slate-700 dark:text-slate-300'
                }`}
              aria-expanded={isSportExpanded}
            >
              <div className="flex items-center gap-3">
                {sport.icon || <Trophy size={16} className="text-slate-400" />}
                <span className="text-sm">{sport.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                  {sport.count}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-300 ease-in-out ${isSportExpanded ? 'rotate-180 text-blue-500' : ''
                    }`}
                />
              </div>
            </button>

            {/* --- Level 2: COUNTRIES (Expandable) --- */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${isSportExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
              <div className="overflow-hidden">
                <div className="pl-3 pr-2 pb-2 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                  {sport.countries && sport.countries.length > 0 ? (
                    sport.countries.map((country) => {
                      const countryKey = `${sport.name}-${country.name}`;
                      const isCountryExpanded = !!expandedCountries[countryKey];

                      return (
                        <div key={countryKey} className="flex flex-col">
                          <button
                            onClick={() => toggleCountry(sport.name, country.name)}
                            className={`flex items-center justify-between w-full py-1.5 px-2 rounded-md transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${isCountryExpanded ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 flex items-center justify-center text-xs opacity-50">
                                <Globe size={12} />
                              </span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ease-in-out ${isCountryExpanded ? 'rotate-180' : ''
                                }`}
                            />
                          </button>

                          {/* --- Level 3: LEAGUES (Expandable) --- */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${isCountryExpanded ? 'grid-rows-[1fr] opacity-100 mt-0.5' : 'grid-rows-[0fr] opacity-0'
                              }`}
                          >
                            <div className="overflow-hidden">
                              <ul className="pl-3 pr-2 pb-1 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                                {country.leagues && country.leagues.length > 0 ? (
                                  country.leagues.map((league) => {
                                    // Highlight if this is the currently selected league
                                    const isActive = currentLeague === league.slug;

                                    return (
                                      <li key={league.id}>
                                        <Link
                                          href={`/?league=${league.slug}`}
                                          onClick={() => onLinkClick?.()}
                                          className={`flex justify-between items-center text-xs py-1.5 px-2 rounded transition-colors ${isActive
                                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                              : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                          <span className="truncate">{league.name}</span>
                                        </Link>
                                      </li>
                                    );
                                  })
                                ) : (
                                  <li className="text-xs text-slate-400 py-1 px-2 italic">
                                    Nema liga...
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 py-1.5 px-2 italic">
                      Učitavanje država...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// DODATO: currentLeague prop i ovde
interface LeftSidebarProps {
  sports: SportWithCount[];
  currentLeague?: string;
}

// 2. DESKTOP WRAPPER
export default function LeftSidebar({ sports, currentLeague }: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] border-r border-border bg-background sticky top-[80px]">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Activity size={20} />
          Sportovi
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Prosleđujemo currentLeague dole u core komponentu */}
        <SidebarContent sports={sports} currentLeague={currentLeague} />
      </div>
    </aside>
  );
}