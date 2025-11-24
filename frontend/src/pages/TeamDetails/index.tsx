import { useParams, Link } from 'react-router-dom';
import { useTeam, useRefreshTeamStats } from '@/hooks/useTeams';
import { Users, Trophy, TrendingUp, Calendar, ArrowLeft, Crown, Award, RefreshCw } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import { useState } from 'react';

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useTeam(id!);
  const refreshStatsMutation = useRefreshTeamStats();
  const { t } = useI18n();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const team: any = data?.team || data;
  const stats: any = data?.stats;

  const handleRefreshStats = async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      await refreshStatsMutation.mutateAsync(id);
      await refetch();
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">{t('team.details.loading')}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto text-muted-foreground mb-4" size={48} />
        <p className="text-muted-foreground">{t('team.details.not.found')}</p>
        <Link to="/teams" className="text-primary hover:underline mt-4 inline-block">
          ← {t('team.details.back.to.teams')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link 
        to="/teams" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} />
        {t('team.details.back.to.teams')}
      </Link>

      {/* Team Header */}
      <div className="bg-card p-8 rounded-lg border border-border mb-6">
        <div className="flex items-start gap-6">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-24 h-24 rounded-lg object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Users size={48} className="text-primary" />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
            <p className="text-2xl text-muted-foreground mb-4">[{team.tag}]</p>
            
            {team.region && (
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm">
                📍 {team.region}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <button
          onClick={handleRefreshStats}
          disabled={isRefreshing || refreshStatsMutation.isPending}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={isRefreshing || refreshStatsMutation.isPending ? 'animate-spin' : ''} />
          {isRefreshing || refreshStatsMutation.isPending ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy size={20} />
            <span className="text-sm">{t('team.details.tournaments.played')}</span>
          </div>
          <p className="text-3xl font-bold">{stats?.gamesPlayed || team.stats?.tournamentsPlayed || 0}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award size={20} />
            <span className="text-sm">{t('team.details.wins')}</span>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{stats?.top1 || team.stats?.tournamentsWon || 0}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp size={20} />
            <span className="text-sm">{t('team.details.total.points')}</span>
          </div>
          <p className="text-3xl font-bold text-primary">{stats?.totalPoints || team.stats?.totalPoints || 0}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy size={20} />
            <span className="text-sm">Total Kills</span>
          </div>
          <p className="text-3xl font-bold text-green-500">{stats?.totalKills || 0}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users size={20} />
            <span className="text-sm">{t('team.details.members')}</span>
          </div>
          <p className="text-3xl font-bold">{team.roster?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roster */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} />
            {t('team.details.roster')}
          </h2>
          
          <div className="space-y-3">
            {/* Captain First */}
            {team.captain && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center">
                  <Crown size={20} className="text-yellow-500" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{team.captain.username || 'Unknown'}</p>
                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold">
                      Captain
                    </span>
                  </div>
                  {team.captain.profile?.ign && (
                    <p className="text-sm text-muted-foreground">IGN: {team.captain.profile.ign}</p>
                  )}
                </div>
              </div>
            )}

            {/* Other Roster Members */}
            {team.roster && team.roster.length > 0 ? (
              team.roster
                .filter((rosterEntry: any) => {
                  // Exclure le capitaine du roster s'il y est
                  if (!rosterEntry.player) return false;
                  const playerId = typeof rosterEntry.player === 'object' 
                    ? rosterEntry.player._id 
                    : rosterEntry.player;
                  const captainId = typeof team.captain === 'object' 
                    ? team.captain._id 
                    : team.captain;
                  return playerId?.toString() !== captainId?.toString();
                })
                .map((rosterEntry: any, index: number) => {
                  // roster.player est directement un User (pas un Player)
                  const player = rosterEntry.player;
                  const username = typeof player === 'object' 
                    ? (player.username || player.nickname || 'Unknown')
                    : 'Unknown';
                  const ign = typeof player === 'object' && player.profile?.ign
                    ? player.profile.ign
                    : null;

                  return (
                    <div 
                      key={rosterEntry._id || index} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="font-bold">{username?.charAt(0).toUpperCase() || '?'}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{username}</p>
                        </div>
                        {ign && (
                          <p className="text-sm text-muted-foreground">IGN: {ign}</p>
                        )}
                      </div>

                      {rosterEntry.role && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {rosterEntry.role}
                        </span>
                      )}
                    </div>
                  );
                })
            ) : !team.captain && (
              <p className="text-muted-foreground text-center py-8">{t('team.details.no.members')}</p>
            )}

            {/* Message si pas de membres dans le roster */}
            {team.roster && team.roster.length === 0 && !team.captain && (
              <p className="text-muted-foreground text-center py-8">{t('team.details.no.members')}</p>
            )}
          </div>
        </div>

        {/* Recent Tournaments */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={24} />
            {t('team.details.tournament.history')}
          </h2>
          
          <div className="space-y-3">
            {team.tournamentHistory && team.tournamentHistory.length > 0 ? (
              team.tournamentHistory.slice(0, 5).map((tournament: any) => (
                <div 
                  key={tournament._id}
                  className="p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold">{tournament.tournament?.name || 'Tournament'}</p>
                    {tournament.placement && (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tournament.placement === 1 
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : tournament.placement === 2
                          ? 'bg-gray-400/20 text-gray-400'
                          : tournament.placement === 3
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        #{tournament.placement}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {tournament.points && (
                      <span>🎯 {tournament.points} pts</span>
                    )}
                    {tournament.kills && (
                      <span>💀 {tournament.kills} kills</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">{t('team.details.no.tournament.history')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {team.createdAt && (
        <div className="mt-6 text-sm text-muted-foreground text-center">
          <Calendar size={14} className="inline mr-1" />
          {t('team.details.created.on')} {new Date(team.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
