import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// For strictly Server-Side rendering (Next.js App Router Server Components),
// it's recommended to use the SUPABASE_SERVICE_ROLE_KEY if you want to bypass RLS policies.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- TypeScript Definitions --- //

export interface OddEntity {
  id: string;
  match_id: string;
  bookie_name: string;
  odd_1: number | null;
  odd_x: number | null;
  odd_2: number | null;
  updated_at: string;
  // include other odds fields here (goals etc.)
}

export interface MatchWithOdds {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  league: string;
  commence_time: number;
  all_odds: OddEntity[]; // Contains all 13 possible bookie odds for this match
}

// --- Fetching Logic --- //

/**
 * Fetches the next 50 upcoming Superbet Master matches
 * along with an aggregate array of odds from all mapped bookmakers.
 */
export async function getMatchesWithGroupedOdds(): Promise<MatchWithOdds[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_grouped_matches_with_odds');

    // Handle Supabase-specific errors during the RPC call
    if (error) {
      console.error('Supabase RPC Error fetching matches with odds:', error.message, error.details);
      throw new Error(`Failed to fetch grouped matches: ${error.message}`);
    }

    // Since RPC returns 'any' payload by default, we safely cast it
    return data as MatchWithOdds[];

  } catch (err) {
    if (err instanceof Error) {
      console.error('Unexpected error in getMatchesWithGroupedOdds:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }

    // In a production Next.js app, you might want to return a specific standard error 
    // format rather than an empty array, depending on your UI handling.
    return [];
  }
}
