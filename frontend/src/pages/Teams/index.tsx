import { useTeams } from '@/hooks/useTeams';
import { Link } from 'react-router-dom';
import { Users, Trophy, TrendingUp, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateTeamModal from '@/components/team/CreateTeamModal';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/i18n/i18n';

export default function Teams() {
  const { data, isLoading } = useTeams();
  const { t } = useI18n();
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const teams = (data as any)?.data || (data as any)?.teams || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">{t('common.loading.teams')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">{t('teams.title')}</h1>
        </div>
        {isAuthenticated && !user?.teamId && (
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            {t('teams.create')}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team: any) => (
          <Link
            key={team._id}
            to={`/teams/${team._id}`}
            className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            {/* Team Header */}
            <div className="flex items-start gap-4 mb-4">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Users size={32} className="text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                <p className="text-muted-foreground text-sm">[{team.tag}]</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <Trophy size={12} />
                  <span>{t('teams.tournaments')}</span>
                </div>
                <p className="font-bold">{team.stats?.tournamentsPlayed || team.stats?.gamesPlayed || 0}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <TrendingUp size={12} />
                  <span>{t('teams.wins')}</span>
                </div>
                <p className="font-bold">{team.stats?.tournamentsWon || team.stats?.wins || team.stats?.top1 || 0}</p>
              </div>
            </div>

            {/* Members count */}
            <div className="mt-4 text-sm text-muted-foreground">
              👥 {team.membersCount || team.roster?.length || 0} {t('home.members')}
            </div>
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground mb-4">{t('teams.none')}</p>
          {isAuthenticated && !user?.teamId && (
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              {t('teams.create.first')}
            </button>
          )}
        </div>
      )}

      {/* Modal de création d'équipe */}
      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={() => setShowCreateTeamModal(false)}
        />
      )}
    </div>
  );
}
