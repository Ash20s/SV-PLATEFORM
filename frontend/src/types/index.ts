// TypeScript types for Battle Royale platform

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'viewer' | 'player' | 'captain' | 'organizer' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    country?: string;
    socials?: {
      twitter?: string;
      discord?: string;
      twitch?: string;
    };
  };
  teamId?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  region: 'EU' | 'NA' | 'ASIA' | 'OCE';
  captain: string | User;
  roster: RosterMember[];
  stats: TeamStatsBasic;
  socials?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  createdAt: Date;
}

export interface RosterMember {
  player: string | Player;
  role: string;
  joinedAt: Date;
}

export interface Player {
  id: string;
  user: string | User;
  nickname: string;
  mainRole?: string;
  team?: string | Team;
  stats?: string | PlayerStats;
  createdAt: Date;
}

export interface PlayerStats {
  id: string;
  player: string | Player;
  period: 'daily' | 'weekly' | 'monthly' | 'season' | 'alltime';
  gamesPlayed: number;
  kills: number;
  deaths: number;
  assists: number;
  knockdowns: number;
  revives: number;
  totalDamage: number;
  avgDamage: number;
  maxDamageInGame: number;
  top1: number;
  top3: number;
  top5: number;
  top10: number;
  avgPlacement: number;
  kda: number;
  killsPerGame: number;
  winrate: number;
  mostPlayedHero?: string;
  heroStats: HeroStat[];
  updatedAt: Date;
}

export interface HeroStat {
  heroName: string;
  gamesPlayed: number;
  kills: number;
  wins: number;
  avgPlacement: number;
}

export interface TeamStatsBasic {
  wins: number;
  losses: number;
  elo: number;
  winrate: number;
}

export interface TeamStats {
  id: string;
  team: string | Team;
  period: 'daily' | 'weekly' | 'monthly' | 'season' | 'alltime';
  gamesPlayed: number;
  totalKills: number;
  avgKillsPerGame: number;
  top1: number;
  top3: number;
  top5: number;
  top10: number;
  avgPlacement: number;
  totalPoints: number;
  elo: number;
  rank: number;
  winrate: number;
  top3Rate: number;
  updatedAt: Date;
}

export interface Scrim {
  id: string;
  organizer: string | User;
  host?: string | Team; // Deprecated - kept for backward compatibility
  opponent?: string | Team;
  tier: 'Tier 1' | 'Tier 2' | 'Both';
  gameMode: 'Trio' | 'Squad';
  participants: ScrimParticipant[];
  date: Date;
  time: string;
  status: 'pending' | 'open' | 'confirmed' | 'completed' | 'cancelled';
  server?: string;
  region: 'EU' | 'NA' | 'ASIA' | 'OCE' | 'SA';
  numberOfGames: number;
  maxTeams: number;
  games: ScrimGame[];
  finalStandings: ScrimStanding[];
  notes?: string;
  createdAt: Date;
}

export interface ScrimParticipant {
  team: string | Team;
  status: 'invited' | 'confirmed' | 'declined';
}

export interface ScrimGame {
  gameNumber: number;
  results: GameResult[];
  mapName?: string;
  vodLink?: string;
}

export interface GameResult {
  team: string | Team;
  placement: number;
  kills: number;
  points: number;
}

export interface ScrimStanding {
  team: string | Team;
  totalPoints: number;
  totalKills: number;
  avgPlacement: number;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  tier: 'Tier 1' | 'Tier 2' | 'Both';
  region?: string;
  gameMode: 'Trio' | 'Squad';
  format: 'points-based' | 'single-elimination' | 'double-elimination';
  pointsSystem: {
    placement: Record<number, number>;
    placementPoints?: Record<number, number>;
    killPoints: number;
  };
  maxTeams: number;
  numberOfGames: number;
  prizePool?: number;
  prizeDistribution?: Array<{
    placement: number;
    percentage: number;
  }>;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'registration' | 'locked' | 'ongoing' | 'completed';
  
  // Scoreboard published games (controlled by organizer)
  publishedGames?: number[];  // Array of game numbers that are published/visible
  
  // Check-in system
  checkInSettings?: {
    enabled: boolean;
    opensAt: string;
    closesAt: string;
  };
  
  // Waitlist
  waitlist?: Array<{
    team: string | Team;
    joinedAt: Date;
    position: number;
  }>;
  
  // Qualification system
  hasQualifiers: boolean;
  qualifierSettings?: {
    numberOfGroups: number;
    teamsPerGroup?: number;
    qualifiersPerGroup: number;
    gamesPerGroup: number;
  };
  qualifierGroups?: QualifierGroup[];
  qualifiedTeams?: Array<string | Team>;
  
  registeredTeams: RegisteredTeam[];
  games: TournamentGame[];
  standings: TournamentStanding[];
  rules?: string;
  organizer: string | User;
  createdAt: Date;
}

export interface QualifierGroup {
  groupName: string;
  teams: Array<string | Team>;
  games: TournamentGame[];
  standings: QualifierStanding[];
}

export interface QualifierStanding {
  team: string | Team;
  totalPoints: number;
  totalKills: number;
  avgPlacement: number;
  gamesPlayed: number;
  qualified: boolean;
}

export interface RegisteredTeam {
  team: string | Team;
  registeredAt: Date;
  checkedIn?: boolean;
  checkedInAt?: Date;
  checkedInBy?: string | User;
}

export interface TournamentGame {
  gameNumber: number;
  date: Date;
  status: 'scheduled' | 'live' | 'completed';
  results: TournamentGameResult[];
  mapName?: string;
  vodLink?: string;
}

export interface TournamentGameResult {
  team: string | Team;
  placement: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

export interface TournamentStanding {
  team: string | Team;
  totalPoints: number;
  totalKills: number;
  totalPlacementPoints?: number;
  pointsBeforeLastGame?: number;
  avgPlacement: number;
  wins: number;
  gamesPlayed: number;
  earnings?: number;
}

export interface Listing {
  id: string;
  author: string | User;
  type: 'LFT' | 'LFP';
  title: string;
  description?: string;
  requirements?: string;
  roles: string[];
  region: 'EU' | 'NA' | 'ASIA' | 'OCE';
  availability: string;
  contact: {
    discord: string;
    twitter?: string;
    email?: string;
  };
  status: 'active' | 'closed';
  expiresAt: Date;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  author: string | User;
  title: string;
  content: string;
  type: 'global' | 'team';
  team?: string | Team;
  createdAt: Date;
}

export interface Hero {
  id: string;
  name: string;
  displayName: string;
  role: 'DPS' | 'Tank' | 'Support' | 'Utility';
  description?: string;
  abilities?: Ability[];
  icon?: string;
  splash?: string;
  stats?: {
    health: number;
    armor: number;
    speed: number;
  };
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  pickRate: number;
  winRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ability {
  name: string;
  description: string;
  cooldown: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'viewer' | 'player';
}

export interface AuthResponse {
  token: string;
  user: User;
}
