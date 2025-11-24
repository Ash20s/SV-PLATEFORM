import { useQuery } from '@tanstack/react-query';
import { Trophy, Target, TrendingUp, Users, Calendar, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/i18n';

export default function Stats() {
  const { t } = useI18n();
  const { user } = useAuth();

  // Récupérer l'équipe du joueur si elle existe
  const { data: teamData } = useQuery({
    queryKey: ['user-team', user?.teamId],
    queryFn: async () => {
      if (!user?.teamId) return null;
      const res = await fetch(`http://localhost:5000/api/teams/${user.teamId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.team;
    },
    enabled: !!user?.teamId,
  });

  // Récupérer tous les tournois pour filtrer ceux où le joueur a participé
  const { data: tournamentsData } = useQuery({
    queryKey: ['user-tournaments', user?.teamId],
    queryFn: async () => {
      if (!user?.teamId) return { tournaments: [] };
      const res = await fetch(`http://localhost:5000/api/tournaments?limit=100`);
      const data = await res.json();
      // Filtrer les tournois où l'équipe du joueur est inscrite
      const userTournaments = data.tournaments?.filter((t: any) => 
        t.teams?.some((team: any) => team._id === user.teamId)
      ) || [];
      return { tournaments: userTournaments };
    },
    enabled: !!user?.teamId,
  });

  const team = teamData;
  const userTournaments = tournamentsData?.tournaments || [];

  // Calculer les stats personnelles
  const stats = {
    tournamentsPlayed: userTournaments.length,
    tournamentsWon: userTournaments.filter((t: any) => 
      t.standings?.[0]?.team?._id === user?.teamId
    ).length,
    topThreeFinishes: userTournaments.filter((t: any) => {
      const standing = t.standings?.find((s: any) => s.team?._id === user?.teamId);
      return standing && standing.placement && standing.placement <= 3;
    }).length,
    totalPoints: userTournaments.reduce((sum: number, t: any) => {
      const standing = t.standings?.find((s: any) => s.team?._id === user?.teamId);
      return sum + (standing?.totalPoints || 0);
    }, 0),
    totalEarnings: userTournaments.reduce((sum: number, t: any) => {
      const standing = t.standings?.find((s: any) => s.team?._id === user?.teamId);
      return sum + (standing?.earnings || 0);
    }, 0),
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <BarChart3 className="mx-auto text-muted-foreground mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-4">{t('stats.personal')}</h2>
        <p className="text-muted-foreground">
          {t('stats.login.required')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">{t('stats.title')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('stats.desc')}
        </p>
      </div>

      {/* Player Info Card */}
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <div className="flex items-center gap-4">
          {user.profile?.avatar && (
            <img 
              src={user.profile.avatar} 
              alt={user.username}
              className="w-16 h-16 rounded-full border-2 border-primary"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Trophy size={20} />
            <p className="text-sm font-medium">{t('stats.tournaments')}</p>
          </div>
          <p className="text-3xl font-bold">{stats.tournamentsPlayed}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('stats.played')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            <Award size={20} />
            <p className="text-sm font-medium">{t('stats.victories')}</p>
          </div>
          <p className="text-3xl font-bold">{stats.tournamentsWon}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('stats.first.place')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-purple-500">
            <TrendingUp size={20} />
            <p className="text-sm font-medium">{t('stats.top.3')}</p>
          </div>
          <p className="text-3xl font-bold">{stats.topThreeFinishes}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('stats.podium.finishes')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-green-500">
            <Target size={20} />
            <p className="text-sm font-medium">{t('stats.total.earnings')}</p>
          </div>
          <p className="text-3xl font-bold">${stats.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('stats.prize.money')}</p>
        </div>
      </div>

      {/* Team Section */}
      {team ? (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={24} />
              <h2 className="text-xl font-bold">{t('stats.my.team')}</h2>
            </div>
            <Link 
              to={`/teams/${team._id}`}
              className="text-sm text-primary hover:underline"
            >
              {t('common.view.full.profile')} →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">{team.name}</h3>
              {team.tag && (
                <p className="text-lg text-muted-foreground mb-4">[{team.tag}]</p>
              )}
              
              {team.members && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{t('common.roster')}</p>
                  {team.members.map((member: any) => (
                    <div key={member._id} className="flex items-center gap-2">
                      <span className={member.role === 'captain' ? 'text-yellow-500' : ''}>
                        {member.role === 'captain' && '👑 '}
                        {member.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground mb-1">Tournaments</p>
                <p className="text-2xl font-bold">{team.stats?.tournamentsPlayed || 0}</p>
              </div>
              <div className="bg-background p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground mb-1">Wins</p>
                <p className="text-2xl font-bold">{team.stats?.tournamentsWon || 0}</p>
              </div>
              <div className="bg-background p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                <p className="text-2xl font-bold">{team.stats?.totalPoints || 0}</p>
              </div>
              <div className="bg-background p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground mb-1">{t('common.region')}</p>
                <p className="text-lg font-bold">{team.region || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-8 rounded-lg border border-border border-dashed mb-8 text-center">
          <Users className="mx-auto text-muted-foreground mb-3" size={48} />
          <h3 className="text-lg font-semibold mb-2">{t('stats.my.team')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('team.management.not.part')}
          </p>
          <Link 
            to="/teams"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
          >
            {t('common.browse')} {t('common.teams')}
          </Link>
        </div>
      )}

      {/* Recent Tournaments */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-primary" size={24} />
          <h2 className="text-xl font-bold">{t('stats.tournaments.history')}</h2>
        </div>

        {userTournaments.length > 0 ? (
          <div className="space-y-3">
            {userTournaments.slice(0, 5).map((tournament: any) => {
              const standing = tournament.standings?.find(
                (s: any) => s.team?._id === user.teamId
              );
              const placement = standing?.placement;
              const hasPlacement = placement !== undefined && placement !== null;

              return (
                <div 
                  key={tournament._id}
                  className="flex items-center justify-between p-4 rounded border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">{tournament.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {hasPlacement && (
                    <div className="text-right">
                      <p className={`font-bold ${
                        placement === 1 ? 'text-yellow-500' :
                        placement === 2 ? 'text-gray-400' :
                        placement === 3 ? 'text-orange-500' :
                        'text-muted-foreground'
                      }`}>
                        {placement === 1 ? '🥇' : placement === 2 ? '🥈' : placement === 3 ? '🥉' : `#${placement}`}
                      </p>
                      <p className="text-sm font-semibold text-green-500">
                        {standing.earnings > 0 ? `$${standing.earnings.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  )}
                  
                  {!hasPlacement && (
                    <span className="text-sm text-muted-foreground">{t('common.no.placement')}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="mx-auto mb-3" size={48} />
            <p>{t('stats.no.tournaments')}</p>
            <p className="text-sm mt-2">{t('team.management.not.part')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
