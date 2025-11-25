import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, TrendingDown, Minus, Filter, Users, Award, Target } from 'lucide-react';

type TierFilter = 'ALL' | 'ELITE' | 'T1' | 'T2H' | 'T2' | 'T3';
type FormatFilter = 'ALL' | 'SQUADS' | 'TRIOS';
type PeriodFilter = 'ALL_TIME' | 'MONTHLY' | 'WEEKLY';
type MatchTypeFilter = 'ALL' | 'SCRIMS' | 'TOURNAMENTS';

interface Team {
  _id: string;
  name: string;
  tag: string;
  mmr: number;
  tier: string;
  avgPlacement: number | null;
  avgPlacementScrims: number | null;
  avgPlacementTournaments: number | null;
  bestPlacement: number | null;
  recentForm: ('W' | 'L' | 'D')[];
  mmrTrend: 'UP' | 'DOWN' | 'STABLE';
  members: any[];
  avatar?: string;
  gamesPlayed: number;
  gamesPlayedScrims: number;
  gamesPlayedTournaments: number;
  format?: 'SQUADS' | 'TRIOS' | 'BOTH';
}

export default function Leaderboard() {
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('ALL');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('ALL_TIME');
  const [matchTypeFilter, setMatchTypeFilter] = useState<MatchTypeFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard', tierFilter, formatFilter, periodFilter, matchTypeFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          tier: tierFilter,
          format: formatFilter,
          period: periodFilter,
          matchType: matchTypeFilter,
        });
        const res = await fetch(`http://localhost:5000/api/leaderboard?${params}`);
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        return [];
      }
    },
  });

  const getTierBadge = (tier: string) => {
    const colors = {
      ELITE: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      T1: 'bg-gradient-to-r from-pink-500 to-primary text-white',
      T2H: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
      T2: 'bg-blue-500/20 text-blue-400 border border-blue-500',
      T3: 'bg-gray-500/20 text-gray-400 border border-gray-500',
    };
    return colors[tier as keyof typeof colors] || colors.T3;
  };

  const getTierName = (tier: string) => {
    const names = {
      ELITE: '👑 Elite',
      T1: '💎 Tier 1',
      T2H: '⚔️ T2 High',
      T2: '🎯 Tier 2',
      T3: '🌱 Tier 3',
    };
    return names[tier as keyof typeof names] || tier;
  };

  const getFormIcon = (result: 'W' | 'L' | 'D') => {
    if (result === 'W') return <div className="w-1.5 h-1.5 bg-white/40 rounded-full" title="Win" />;
    if (result === 'L') return <div className="w-1.5 h-1.5 bg-white/10 rounded-full" title="Loss" />;
    return <div className="w-1.5 h-1.5 bg-white/20 rounded-full" title="Draw" />;
  };

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    if (trend === 'UP') return <TrendingUp className="text-white/40" size={16} />;
    if (trend === 'DOWN') return <TrendingDown className="text-white/20" size={16} />;
    return <Minus className="text-white/10" size={16} />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      {/* Header - Simplifié */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            <Trophy className="inline mr-2 text-primary" size={28} />
            MMR Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Team rankings based on performance
            {matchTypeFilter !== 'ALL' && (
              <span className="ml-2 text-primary">
                • Showing {matchTypeFilter === 'SCRIMS' ? 'Scrims' : 'Tournaments'} data only
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-card border border-border/50 px-3 py-2 rounded-lg hover:border-primary/50 transition-colors text-sm"
        >
          <Filter size={16} />
          <span>Filters {(tierFilter !== 'ALL' || formatFilter !== 'ALL' || periodFilter !== 'ALL_TIME' || matchTypeFilter !== 'ALL') && '•'}</span>
        </button>
      </div>

      {/* Filters Panel - Simplifié */}
      {showFilters && (
        <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm mb-3">Filter Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tier Filter */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as TierFilter)}
                className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="ALL">All Tiers</option>
                <option value="ELITE">Elite (2200+)</option>
                <option value="T1">Tier 1 (1900-2199)</option>
                <option value="T2H">Tier 2 High (1600-1899)</option>
                <option value="T2">Tier 2 (1300-1599)</option>
                <option value="T3">Tier 3 (0-1299)</option>
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                Format
              </label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as FormatFilter)}
                className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="ALL">All Formats</option>
                <option value="SQUADS">Squads</option>
                <option value="TRIOS">Trios</option>
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                Period
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="MONTHLY">This Month</option>
                <option value="WEEKLY">This Week</option>
              </select>
            </div>

            {/* Match Type Filter */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
                Match Type
              </label>
              <select
                value={matchTypeFilter}
                onChange={(e) => setMatchTypeFilter(e.target.value as MatchTypeFilter)}
                className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="ALL">All Matches</option>
                <option value="SCRIMS">Scrims Only</option>
                <option value="TOURNAMENTS">Tournaments Only</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary - Simplifié */}
          {(tierFilter !== 'ALL' || formatFilter !== 'ALL' || periodFilter !== 'ALL_TIME' || matchTypeFilter !== 'ALL') && (
            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Active:</span>
              {tierFilter !== 'ALL' && (
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">
                  {tierFilter}
                </span>
              )}
              {formatFilter !== 'ALL' && (
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">
                  {formatFilter}
                </span>
              )}
              {periodFilter !== 'ALL_TIME' && (
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">
                  {periodFilter}
                </span>
              )}
              {matchTypeFilter !== 'ALL' && (
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">
                  {matchTypeFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setTierFilter('ALL');
                  setFormatFilter('ALL');
                  setPeriodFilter('ALL_TIME');
                  setMatchTypeFilter('ALL');
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-primary/70"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary - Simplifié */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Teams</div>
          <div className="text-xl font-bold">{teams.length}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Elite</div>
          <div className="text-xl font-bold text-yellow-500">
            {teams.filter((t: Team) => t.tier === 'ELITE').length}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Tier 1</div>
          <div className="text-xl font-bold text-pink-500">
            {teams.filter((t: Team) => t.tier === 'T1').length}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">
            {matchTypeFilter === 'SCRIMS' ? 'Avg Scrims' : matchTypeFilter === 'TOURNAMENTS' ? 'Avg Tournaments' : 'Avg Games'}
          </div>
          <div className="text-xl font-bold">
            {teams.length > 0
              ? Math.round(teams.reduce((sum: number, t: Team) => sum + (t.gamesPlayed || 0), 0) / teams.length)
              : 0}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-pulse">Loading leaderboard...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">⚠️ Error loading leaderboard</div>
            <div className="text-muted-foreground text-sm">Please check if the backend is running</div>
          </div>
        ) : !teams || teams.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Trophy className="mx-auto text-muted-foreground" size={64} />
            <div>
              <p className="text-xl font-bold mb-2">No teams found</p>
              <p className="text-muted-foreground">
                {matchTypeFilter !== 'ALL' 
                  ? `No teams have played ${matchTypeFilter === 'SCRIMS' ? 'scrims' : 'tournaments'} yet.`
                  : 'The leaderboard will populate as teams compete in scrims and tournaments.'}
              </p>
              {(tierFilter !== 'ALL' || formatFilter !== 'ALL' || periodFilter !== 'ALL_TIME' || matchTypeFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setTierFilter('ALL');
                    setFormatFilter('ALL');
                    setPeriodFilter('ALL_TIME');
                    setMatchTypeFilter('ALL');
                  }}
                  className="mt-4 text-sm text-primary hover:text-primary/80"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/50 border-b border-border/50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Team
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    MMR
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Tier
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <span>Avg Place</span>
                      {matchTypeFilter !== 'ALL' && (
                        <span className="text-primary text-[10px] font-normal normal-case">
                          {matchTypeFilter === 'SCRIMS' ? 'Scrims Only' : 'Tournaments Only'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <span>Games</span>
                      {matchTypeFilter !== 'ALL' && (
                        <span className="text-primary text-[10px] font-normal normal-case">
                          {matchTypeFilter === 'SCRIMS' ? 'Scrims Only' : 'Tournaments Only'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team: Team, index: number) => (
                  <tr
                    key={team._id}
                    className="border-b border-border/30 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4">
                      <span className="text-base font-bold text-muted-foreground">
                        {getRankBadge(index + 1)}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-xs font-bold text-white/60">
                          {team.tag || team.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{team.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.members?.length || 0} members
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MMR */}
                    <td className="py-3 px-4 text-center">
                      <div className="text-base font-bold">
                        {team.mmr}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTierBadge(team.tier)}`}>
                        {getTierName(team.tier)}
                      </span>
                    </td>

                    {/* Average Placement */}
                    <td className="py-3 px-4 text-center">
                      <div className="text-base font-semibold">
                        {team.avgPlacement !== null && team.avgPlacement !== undefined
                          ? team.avgPlacement.toFixed(1)
                          : '-'}
                      </div>
                    </td>

                    {/* Games Played */}
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm text-muted-foreground">
                        {team.gamesPlayed || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-card border border-border/50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-semibold mb-2 text-muted-foreground">Tiers</div>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">👑 Elite</span>
                <span className="text-muted-foreground">2200+ MMR</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-pink-500 to-primary text-white px-2 py-0.5 rounded text-xs font-bold">💎 Tier 1</span>
                <span className="text-muted-foreground">1900-2199</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">⚔️ T2 High</span>
                <span className="text-muted-foreground">1600-1899</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500 px-2 py-0.5 rounded text-xs font-bold">🎯 Tier 2</span>
                <span className="text-muted-foreground">1300-1599</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-gray-500/20 text-gray-400 border border-gray-500 px-2 py-0.5 rounded text-xs font-bold">🌱 Tier 3</span>
                <span className="text-muted-foreground">0-1299</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-muted-foreground">Metrics</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>MMR</strong>: Matchmaking Rating</li>
              <li><strong>Avg Place</strong>: Average finish after each session</li>
              <li><strong>Games</strong>: Total sessions played</li>
              <li><strong>Session</strong>: 6-8 games (Scrims or Tournament)</li>
              <li>Lower placement = Better performance</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-muted-foreground">Formats</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong>Squads</strong>: 10 teams per lobby</li>
              <li><strong>Trios</strong>: 12 teams per lobby</li>
              <li>Points based on placement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

