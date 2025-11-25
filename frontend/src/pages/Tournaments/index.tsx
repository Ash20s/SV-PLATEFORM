import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Users, Filter, Plus, CheckCircle2, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import CreateTournamentModal from '@/components/organizer/CreateTournamentModal';

export default function Tournaments() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);
  
  // Vérification robuste du rôle - vérifier aussi localStorage au cas où
  const getStoredUserRole = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.role;
      }
    } catch (e) {
      return null;
    }
    return null;
  };
  
  const userRole = user?.role || getStoredUserRole();
  // Vérification stricte avec logs pour debug
  const isOrganizer = userRole === 'organizer';
  const isAdmin = userRole === 'admin';
  const isOrganizerOrAdmin = isOrganizer || isAdmin;
  
  // Debug: vérifier le user et le rôle
  useEffect(() => {
    const storedUserStr = localStorage.getItem('auth_user');
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    
    console.log('=== TOURNAMENTS DEBUG ===');
    console.log('User from hook:', user);
    console.log('User role:', userRole);
    console.log('Stored user:', storedUser);
    console.log('Stored user role:', storedUser?.role);
    console.log('isOrganizer:', isOrganizer);
    console.log('isAdmin:', isAdmin);
    console.log('isOrganizerOrAdmin:', isOrganizerOrAdmin);
    console.log('Role check organizer (strict):', userRole === 'organizer');
    console.log('Role check admin (strict):', userRole === 'admin');
    console.log('Type of role:', typeof userRole);
    console.log('Role value:', JSON.stringify(userRole));
    console.log('==========================');
  }, [user, userRole, isOrganizer, isAdmin, isOrganizerOrAdmin]);

  const { data: tournamentsData, isLoading, error } = useQuery({
    queryKey: ['tournaments', 'all'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/tournaments?limit=50');
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      return res.json();
    },
    retry: 1
  });

  const tournaments = tournamentsData?.tournaments || [];
  
  // Filter by tier
  const filteredTournaments = tierFilter === 'all' 
    ? tournaments 
    : tournaments.filter((t: any) => t.tier === tierFilter || t.tier === 'Both');

  // Helper function to check if user's team is registered
  const isTournamentRegistered = (tournament: any) => {
    if (!isAuthenticated || !authUser?.teamId) return false;
    return tournament.registeredTeams?.some(
      (r: any) => r.team?._id === authUser.teamId || r.team === authUser.teamId
    ) || false;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500" size={32} />
          <h1 className="text-3xl font-bold">{t('tournaments.title')}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Bouton créer tournoi (visible uniquement pour organizer/admin) */}
          {isOrganizerOrAdmin && (
            <button
              onClick={() => setShowCreateTournamentModal(true)}
              className="bg-yellow-500/10 border-2 border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {t('organizer.create.tournament')}
            </button>
          )}
          
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-card border border-border rounded px-3 py-2 text-sm"
            >
              <option value="all">{t('common.tier.all')}</option>
              <option value="Tier 1">{t('common.tier.1')}</option>
              <option value="Tier 2">{t('common.tier.2')}</option>
              <option value="Both">{t('common.tier.both')}</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">{t('common.loading.tournaments')}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <Trophy className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-500 text-lg mb-2">Error loading tournaments</p>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 group/tournaments">
        {filteredTournaments.map((tournament: any) => {
          const isRegistered = isTournamentRegistered(tournament);
          const canRegister = isAuthenticated && 
                             authUser?.teamId && 
                             tournament.status === 'registration' && 
                             !isRegistered && 
                             (tournament.registeredTeams?.length || 0) < (tournament.maxTeams || 0);
          
          return (
            <div
              key={tournament._id}
              className="bg-card p-6 rounded-lg border border-primary/20 hover:border-primary transition-all group/card
                         group-has-[.group\/card:hover]/tournaments:opacity-40 hover:!opacity-100"
            >
              <Link to={`/tournaments/${tournament._id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">{tournament.name}</h3>
                  {tournament.tier && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tournament.tier === 'Tier 1' 
                        ? 'bg-purple-500/10 text-purple-500' 
                        : tournament.tier === 'Tier 2'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {tournament.tier}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={16} />
                    <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="font-semibold text-foreground">
                      {tournament.registeredTeams?.length || 0} / {tournament.maxTeams}
                    </span>
                    <span className="text-xs">teams</span>
                  </div>

                  {tournament.region && (
                    <div className="text-muted-foreground">
                      📍 {tournament.region}
                    </div>
                  )}

                  {tournament.prizePool && (
                    <div className="bg-[#FFBE0B] text-black px-3 py-1 rounded font-bold text-sm inline-block">
                      ${tournament.prizePool}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                    tournament.status === 'registration' 
                      ? 'bg-green-500/10 text-green-500'
                      : tournament.status === 'pending'
                      ? 'bg-[#FFB800] text-black'
                      : tournament.status === 'ongoing'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : tournament.status === 'locked'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {tournament.status === 'registration' ? '🔓 Open' : 
                     tournament.status === 'pending' ? '⏳ Pending' :
                     tournament.status === 'locked' ? '🔒 Locked' :
                     tournament.status === 'ongoing' ? '▶️ Ongoing' :
                     tournament.status}
                  </span>
                </div>
              </Link>

              {/* Registration Status */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {isRegistered && (
                  <div className="flex items-center gap-2 text-green-500 px-3 py-2 bg-green-500/10 rounded-lg text-sm">
                    <CheckCircle2 size={16} />
                    <span className="font-semibold">{t('tournament.register.already.registered')}</span>
                  </div>
                )}

                {canRegister && (
                  <div className="flex items-center gap-2 text-primary px-3 py-2 bg-primary/10 rounded-lg text-sm">
                    <UserPlus size={16} />
                    <span className="font-semibold">{t('tournament.register.button')}</span>
                  </div>
                )}

                {tournament.status !== 'registration' && !isRegistered && (
                  <div className="flex items-center gap-2 text-muted-foreground px-3 py-2 bg-muted rounded-lg text-sm">
                    <span>Registration closed</span>
                  </div>
                )}

                {(tournament.registeredTeams?.length || 0) >= (tournament.maxTeams || 0) && 
                 tournament.status === 'registration' && 
                 !isRegistered && (
                  <div className="flex items-center gap-2 text-red-500 px-3 py-2 bg-red-500/10 rounded-lg text-sm">
                    <span>Full</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground text-lg">
            {tierFilter === 'all' 
              ? t('tournaments.none')
              : t('tournaments.none.filtered').replace('{tier}', tierFilter)}
          </p>
        </div>
      )}

      {/* Modal de création de tournoi */}
      {showCreateTournamentModal && (
        <CreateTournamentModal onClose={() => setShowCreateTournamentModal(false)} />
      )}
    </div>
  );
}
