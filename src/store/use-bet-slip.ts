import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BetSlipItem {
    id: string; // ID meča
    homeTeam: string;
    awayTeam: string;
    selection: '1' | 'X' | '2'; // Šta je odigrano
    oddValue: number; // Kvota
    bookie: string; // Kladionica
}

interface BetSlipState {
    items: BetSlipItem[];
    addItem: (item: BetSlipItem) => void;
    removeItem: (matchId: string) => void;
    clearSlip: () => void;
}

export const useBetSlipStore = create<BetSlipState>()(
    persist(
        (set) => ({
            items: [],

            addItem: (newItem) => set((state) => {
                // Ako meč već postoji na tiketu, samo mu ažuriraj tip (npr. predomislio se sa 1 na 2)
                const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);

                if (existingItemIndex >= 0) {
                    const newItems = [...state.items];
                    newItems[existingItemIndex] = newItem;
                    return { items: newItems };
                }

                // Ako je novi meč, dodaj ga na listu
                return { items: [...state.items, newItem] };
            }),

            removeItem: (matchId) => set((state) => ({
                items: state.items.filter((item) => item.id !== matchId)
            })),

            clearSlip: () => set({ items: [] }),
        }),
        {
            name: 'kvoters-bet-slip', // Ime pod kojim se čuva u localStorage-u browsera
        }
    )
);