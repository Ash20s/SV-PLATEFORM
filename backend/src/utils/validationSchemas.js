// Zod validation schemas for Battle Royale platform
const { z } = require('zod');

// Auth schemas
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['viewer', 'player', 'captain', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Team schemas
const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
  tag: z.string().min(2).max(5).toUpperCase(),
  logo: z.string().url().optional(),
  region: z.enum(['EU', 'NA', 'ASIA', 'OCE']),
  socials: z.object({
    twitter: z.string().optional(),
    discord: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

const updateRosterSchema = z.object({
  action: z.enum(['add', 'remove']),
  playerId: z.string(),
  role: z.string().optional(),
});

// Scrim schemas
const createScrimSchema = z.object({
  date: z.string(), // ISO date string or date string
  time: z.string().optional(),
  region: z.enum(['EU', 'NA', 'ASIA', 'OCE', 'SA']).optional(),
  tier: z.enum(['Tier 1', 'Tier 2', 'Both']).optional(),
  gameMode: z.enum(['Trio', 'Squad']).optional(),
  numberOfGames: z.number().min(1).max(10).optional(),
  maxTeams: z.number().min(2).max(12).optional(), // Max 12 for Trio, 10 for Squad
  notes: z.string().optional(),
});

const updateScrimResultsSchema = z.object({
  gameNumber: z.number(),
  results: z.array(z.object({
    teamId: z.string(),
    placement: z.number().min(1).max(60),
    kills: z.number().min(0),
  })),
  mapName: z.string().optional(),
  vodLink: z.string().url().optional(),
});

// Tournament schemas
const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  format: z.enum(['points-based', 'single-elimination', 'double-elimination']).optional(),
  gameMode: z.enum(['Trio', 'Squad']).optional(),
  pointsSystem: z.object({
    placement: z.record(z.number()),
    killPoints: z.number(),
  }).optional(),
  maxTeams: z.number().min(2).max(12), // Max 12 for Trio, 10 for Squad
  numberOfGames: z.number().min(1).max(20).optional(),
  prizePool: z.number().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rules: z.string().optional(),
  tier: z.enum(['Tier 1', 'Tier 2', 'Both']).optional(),
  region: z.enum(['EU', 'NA', 'ASIA', 'OCE', 'SA']).optional(),
  hasQualifiers: z.boolean().optional(),
  qualifierSettings: z.object({
    numberOfGroups: z.number().optional(),
    teamsPerGroup: z.number().optional(),
    qualifiersPerGroup: z.number().optional(),
    gamesPerGroup: z.number().optional(),
  }).optional(),
});

const updateBracketsSchema = z.object({
  gameNumber: z.number(),
  results: z.array(z.object({
    teamId: z.string(),
    placement: z.number().min(1),
    kills: z.number().min(0),
  })),
  mapName: z.string().optional(),
  vodLink: z.string().url().optional(),
  date: z.string().datetime().optional(),
});

// Listing schemas (LFT/LFP)
const createListingSchema = z.object({
  type: z.enum(['LFT', 'LFP']),
  title: z.string().min(5).max(100),
  description: z.string().optional(),
  requirements: z.string().optional(),
  roles: z.array(z.string()),
  region: z.enum(['EU', 'NA', 'ASIA', 'OCE']),
  availability: z.string(),
  contact: z.object({
    discord: z.string(),
    twitter: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

// Announcement schemas
const createAnnouncementSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  type: z.enum(['global', 'team']),
  teamId: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createTeamSchema,
  updateRosterSchema,
  createScrimSchema,
  updateScrimResultsSchema,
  createTournamentSchema,
  updateBracketsSchema,
  createListingSchema,
  createAnnouncementSchema,
};
