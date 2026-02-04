export interface Odds {
  homeWin: number;
  draw: number;
  awayWin: number;
}

export interface BookmakerOdds {
  [bookmaker: string]: Odds;
}

export interface Match {
  matchId: string;
  teams: {
    home: string;
    away: string;
  };
  league: string;
  sport: string;
  time: string; // ISO 8601 format
  odds: BookmakerOdds;
}
