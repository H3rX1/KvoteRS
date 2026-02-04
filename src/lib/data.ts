import type { Match } from '@/types';

export const matches: Match[] = [
  {
    matchId: 'match_1',
    teams: {
      home: 'Manchester United',
      away: 'Liverpool',
    },
    league: 'Premier League',
    sport: 'Football',
    time: '2024-08-18T19:00:00Z',
    odds: {
      betfair: {
        homeWin: 2.8,
        draw: 3.5,
        awayWin: 2.5,
      },
      paddypower: {
        homeWin: 2.75,
        draw: 3.6,
        awayWin: 2.55,
      },
      williamhill: {
        homeWin: 2.85,
        draw: 3.4,
        awayWin: 2.5,
      },
    },
  },
  {
    matchId: 'match_2',
    teams: {
      home: 'Los Angeles Lakers',
      away: 'Boston Celtics',
    },
    league: 'NBA',
    sport: 'Basketball',
    time: '2024-08-19T02:30:00Z',
    odds: {
      betfair: {
        homeWin: 1.9,
        draw: 12.0, // Draws are rare in basketball
        awayWin: 1.95,
      },
      paddypower: {
        homeWin: 1.91,
        draw: 13.0,
        awayWin: 1.91,
      },
      williamhill: {
        homeWin: 1.88,
        draw: 11.5,
        awayWin: 2.0,
      },
    },
  },
  {
    matchId: 'match_3',
    teams: {
      home: 'Real Madrid',
      away: 'Barcelona',
    },
    league: 'La Liga',
    sport: 'Football',
    time: '2024-08-20T20:00:00Z',
    odds: {
      betfair: {
        homeWin: 2.1,
        draw: 3.4,
        awayWin: 3.2,
      },
      paddypower: {
        homeWin: 2.15,
        draw: 3.3,
        awayWin: 3.1,
      },
      williamhill: {
        homeWin: 2.05,
        draw: 3.5,
        awayWin: 3.3,
      },
    },
  },
  {
    matchId: 'match_4',
    teams: {
      home: 'Golden State Warriors',
      away: 'Brooklyn Nets',
    },
    league: 'NBA',
    sport: 'Basketball',
    time: '2024-08-21T01:00:00Z',
    odds: {
      betfair: {
        homeWin: 1.5,
        draw: 14.0,
        awayWin: 2.6,
      },
      paddypower: {
        homeWin: 1.52,
        draw: 15.0,
        awayWin: 2.55,
      },
      williamhill: {
        homeWin: 1.48,
        draw: 13.5,
        awayWin: 2.65,
      },
    },
  },
];
