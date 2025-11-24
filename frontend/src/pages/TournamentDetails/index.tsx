import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, Calendar, Users, DollarSign, Award, 
  FileText, Clock, AlertCircle, ChevronRight, Target, UserPlus, CheckCircle2, XCircle, Lock, Unlock, ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useTournament, useRegisterTournament } from '@/hooks/useTournaments';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import Scoreboard from '@/components/tournament/Scoreboard';
import api from '@/services/api';
import { useState, useEffect } from 'react';

export default function TournamentDetails() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<boolean>(false);
  
  const { data, isLoading, error: fetchError, refetch } = useTournament(id || '');
  const registerMutation = useRegisterTournament();
  const queryClient = useQueryClient();

  // Lock/Unlock mutations - MUST be called before any conditional returns
  const lockMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await api.put(`/tournaments/${tournamentId}/lock`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      setSuccess('Tournament locked successfully');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to lock tournament');
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await api.put(`/tournaments/${tournamentId}/unlock`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      setSuccess('Tournament unlocked successfully');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to unlock tournament');
    }
  });

  const publishScoresMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const res = await api.post(`/tournaments/${tournamentId}/publish-scores`);
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      const newlyPublished = data.newlyPublished || [];
      setSuccess(`Published ${newlyPublished.length} new game(s) to scoreboard (Games: ${newlyPublished.join(', ')})`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to publish scores');
    }
  });

  const tournament = data?.tournament;

  // Helper functions to safely format dates
  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'Not set';
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Not set';
    }
    
    return date.toLocaleString();
  };

  // Calculate check-in dates from tournament start date if not set
  const getCheckInDates = () => {
    if (!tournament?.startDate) {
      return { opensAt: null, closesAt: null };
    }

    const startDate = new Date(tournament.startDate);
    if (isNaN(startDate.getTime())) {
      return { opensAt: null, closesAt: null };
    }

    // If check-in dates are already set, use them
    if (tournament.checkInSettings?.opensAt && tournament.checkInSettings?.closesAt) {
      return {
        opensAt: tournament.checkInSettings.opensAt,
        closesAt: tournament.checkInSettings.closesAt
      };
    }

    // Otherwise, calculate them automatically (2h before start, 30min before start)
    return {
      opensAt: new Date(startDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
      closesAt: new Date(startDate.getTime() - 30 * 60 * 1000), // 30 min before
    };
  };

  const formatDateOnly = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'Not set';
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Not set';
    }
    
    return date.toLocaleDateString();
  };

  const formatTimeOnly = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'Not set';
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Not set';
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Log pour le débogage (seulement après chargement)
  useEffect(() => {
    if (tournament) {
      console.log('Tournament loaded:', {
        id: tournament._id,
        name: tournament.name,
        status: tournament.status,
        hasQualifiers: tournament.hasQualifiers,
        qualifierGroups: tournament.qualifierGroups?.length || 0,
        registeredTeams: tournament.registeredTeams?.length || 0
      });
    }
  }, [tournament]);

  // Vérifier si l'utilisateur est déjà inscrit
  const isRegistered = tournament?.registeredTeams?.some(
    (r: any) => r.team?._id === user?.teamId || r.team === user?.teamId
  ) || false;

  // Vérifier si l'utilisateur peut s'inscrire
  const canRegister = 
    isAuthenticated &&
    user?.teamId &&
    tournament?.status === 'registration' &&
    !isRegistered &&
    (tournament?.registeredTeams?.length || 0) < (tournament?.maxTeams || 0);

  const handleRegister = async () => {
    if (!id) return;
    
    setError(null);
    setSuccess(null);

    // Vérifications côté client
    if (!isAuthenticated) {
      setError(t('tournament.register.must.login'));
      return;
    }

    if (!user?.teamId) {
      setError(t('tournament.register.must.have.team'));
      return;
    }

    try {
      await registerMutation.mutateAsync(id);
      setSuccess(t('tournament.register.success'));
      refetch();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('tournament.register.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2 text-red-500">Error Loading Tournament</h2>
        <p className="text-muted-foreground">
          {fetchError instanceof Error ? fetchError.message : 'Failed to load tournament data'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">{t('tournament.details.not.found')}</h2>
        <p className="text-muted-foreground">{t('tournament.details.not.found.desc')}</p>
      </div>
    );
  }

  const statusColors = {
    upcoming: 'bg-blue-500/10 text-blue-500',
    registration: 'bg-green-500/10 text-green-500',
    locked: 'bg-purple-500/10 text-purple-500',
    ongoing: 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-gray-500/10 text-gray-400'
  };

  // Check if user is organizer or admin
  const isOrganizerOrAdmin = (() => {
    if (!user || !tournament) return false;
    
    // Check role first - any organizer or admin can manage tournaments
    if (user.role === 'organizer' || user.role === 'admin') {
      return true;
    }
    
    // Check if user is the organizer of this specific tournament
    const organizerId = typeof tournament.organizer === 'object' 
      ? tournament.organizer?._id?.toString() || tournament.organizer?.id?.toString()
      : tournament.organizer?.toString();
    const userId = user.id?.toString();
    
    return organizerId === userId;
  })();

  const handleLock = () => {
    if (!id) return;
    setError(null);
    setSuccess(null);
    lockMutation.mutate(id);
  };

  const handleUnlock = () => {
    if (!id) return;
    setError(null);
    setSuccess(null);
    unlockMutation.mutate(id);
  };

  const handlePublishScores = () => {
    if (!id) return;
    setError(null);
    setSuccess(null);
    publishScoresMutation.mutate(id);
  };

  const tierColors = {
    'Tier 1': 'bg-purple-500/10 text-purple-500',
    'Tier 2': 'bg-blue-500/10 text-blue-500',
    'Both': 'bg-gray-500/10 text-gray-400'
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={32} />
                <h1 className="text-3xl font-bold">{tournament.name}</h1>
              </div>
              {isOrganizerOrAdmin && (
                <div className="flex items-center gap-2">
                  {tournament.status === 'registration' && (
                    <button
                      onClick={handleLock}
                      disabled={lockMutation.isPending}
                      className="bg-purple-500/10 border border-purple-500/30 text-purple-500 px-4 py-2 rounded-lg font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Lock size={18} />
                      Lock Tournament
                    </button>
                  )}
                  {tournament.status === 'locked' && (
                    <button
                      onClick={handleUnlock}
                      disabled={unlockMutation.isPending}
                      className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-lg font-semibold hover:bg-green-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Unlock size={18} />
                      Unlock Tournament
                    </button>
                  )}
                  {(tournament.status === 'locked' || tournament.status === 'ongoing' || tournament.status === 'completed') && (
                    <button
                      onClick={handlePublishScores}
                      disabled={publishScoresMutation.isPending}
                      className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                      title="Publish new completed games to scoreboard"
                    >
                      <BarChart3 size={18} />
                      {publishScoresMutation.isPending ? 'Publishing...' : 'Publish Scores'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded text-sm font-semibold ${statusColors[tournament.status]}`}>
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </span>
              
              {tournament.tier && (
                <span className={`px-3 py-1 rounded text-sm font-semibold ${tierColors[tournament.tier]}`}>
                  {tournament.tier}
                </span>
              )}
              
              {tournament.region && (
                <span className="px-3 py-1 rounded text-sm bg-muted">
                  {tournament.region}
                </span>
              )}
            </div>
          </div>
        </div>

        {tournament.description && (
          <p className="text-muted-foreground text-lg">{tournament.description}</p>
        )}

        {/* Registration Button */}
        <div className="mt-6">
          {canRegister && (
            <button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={20} />
              {registerMutation.isPending ? t('tournament.register.registering') : t('tournament.register.button')}
            </button>
          )}

          {isRegistered && (
            <div className="flex items-center gap-2 text-green-500 px-4 py-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 size={20} />
              <span className="font-semibold">{t('tournament.register.already.registered')}</span>
            </div>
          )}

          {!isAuthenticated && tournament?.status === 'registration' && (
            <div className="text-muted-foreground">
              <p className="mb-2">{t('tournament.register.must.login')}</p>
              <Link to="/login" className="text-primary hover:underline">
                {t('nav.login')}
              </Link>
            </div>
          )}

          {isAuthenticated && !user?.teamId && tournament?.status === 'registration' && (
            <div className="text-muted-foreground">
              <p className="mb-2">{t('tournament.register.must.have.team')}</p>
              <Link to="/teams" className="text-primary hover:underline">
                {t('tournament.register.create.team')}
              </Link>
            </div>
          )}

          {tournament?.status !== 'registration' && (
            <div className="flex items-center gap-2 text-muted-foreground px-4 py-2 bg-muted rounded-lg">
              <XCircle size={20} />
              <span>{t('tournament.register.closed')}</span>
            </div>
          )}

          {(tournament?.registeredTeams?.length || 0) >= (tournament?.maxTeams || 0) && tournament?.status === 'registration' && !isRegistered && (
            <div className="flex items-center gap-2 text-red-500 px-4 py-2 bg-red-500/10 rounded-lg mt-2">
              <XCircle size={20} />
              <span>{t('tournament.register.full')}</span>
            </div>
          )}

          {error && (
            <div className="mt-2 text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-2 text-green-500 text-sm bg-green-500/10 px-4 py-2 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Calendar size={20} />
            <p className="text-sm font-medium">{t('tournament.details.start.date')}</p>
          </div>
          <p className="text-xl font-bold">
            {formatDateOnly(tournament.startDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTimeOnly(tournament.startDate)}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-green-500">
            <DollarSign size={20} />
            <p className="text-sm font-medium">{t('tournament.details.prize.pool')}</p>
          </div>
          <p className="text-xl font-bold">
            {tournament.prizePool ? `$${tournament.prizePool.toLocaleString()}` : 'TBD'}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Users size={20} />
            <p className="text-sm font-medium">{t('tournament.details.teams')}</p>
          </div>
          <p className="text-xl font-bold">
            {tournament.registeredTeams?.length || 0} / {tournament.maxTeams}
          </p>
          <p className="text-sm text-muted-foreground">{t('tournament.details.registered')}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-purple-500">
            <Target size={20} />
            <p className="text-sm font-medium">{t('tournament.details.format')}</p>
          </div>
          <p className="text-xl font-bold">{tournament.numberOfGames}</p>
          <p className="text-sm text-muted-foreground">Games</p>
        </div>
      </div>

      {/* Check-in Status */}
      {tournament.checkInSettings?.enabled && (() => {
        const checkInDates = getCheckInDates();
        return (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-primary" size={24} />
              <h2 className="text-xl font-bold">Check-in Status</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Check-in Window</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Opens:</span>
                    <span className="font-medium">
                      {formatDate(checkInDates.opensAt)}
                    </span>
                    {!tournament.checkInSettings?.opensAt && checkInDates.opensAt && (
                      <span className="text-xs text-muted-foreground">(auto-calculated)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Closes:</span>
                    <span className="font-medium">
                      {formatDate(checkInDates.closesAt)}
                    </span>
                    {!tournament.checkInSettings?.closesAt && checkInDates.closesAt && (
                      <span className="text-xs text-muted-foreground">(auto-calculated)</span>
                    )}
                  </div>
                </div>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="text-sm text-blue-400">
                  ℹ️ Only team captains can check-in. Teams that don't check-in will be replaced by waitlist teams.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">{t('tournament.details.teams.status')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {tournament.registeredTeams?.filter((r: any) => r.checkedIn).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('tournament.details.checked.in')}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {tournament.registeredTeams?.filter((r: any) => !r.checkedIn).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('tournament.details.not.checked.in')}</p>
                </div>
              </div>
              
              {tournament.waitlist && tournament.waitlist.length > 0 && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                  <p className="text-sm">
                    <span className="font-semibold text-purple-400">{tournament.waitlist.length}</span>
                    <span className="text-muted-foreground"> team(s) in waitlist</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
          );
        })()}

      {/* Prize Distribution */}
      {tournament.prizePool && tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold">Prize Distribution</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tournament.prizeDistribution.map((prize: any) => {
              const amount = (tournament.prizePool * prize.percentage) / 100;
              const medals = ['🥇', '🥈', '🥉'];
              
              return (
                <div 
                  key={prize.placement}
                  className="bg-background p-4 rounded border border-border text-center"
                >
                  <div className="text-2xl mb-2">
                    {prize.placement <= 3 ? medals[prize.placement - 1] : `#${prize.placement}`}
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    ${amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prize.percentage}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Qualification System */}
      {tournament.hasQualifiers && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Qualification System</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-background p-4 rounded border border-border">
              <p className="text-sm text-muted-foreground mb-1">Groups</p>
              <p className="text-2xl font-bold">{tournament.qualifierSettings?.numberOfGroups}</p>
            </div>
            <div className="bg-background p-4 rounded border border-border">
              <p className="text-sm text-muted-foreground mb-1">Qualifiers per Group</p>
              <p className="text-2xl font-bold">{tournament.qualifierSettings?.qualifiersPerGroup}</p>
            </div>
            <div className="bg-background p-4 rounded border border-border">
              <p className="text-sm text-muted-foreground mb-1">Games per Group</p>
              <p className="text-2xl font-bold">{tournament.qualifierSettings?.gamesPerGroup}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('tournament.details.qualifier.info').replace('{groups}', tournament.qualifierSettings?.numberOfGroups?.toString() || '0')} 
            Top {tournament.qualifierSettings?.qualifiersPerGroup} teams from each group advance to the finals.
          </p>

          {tournament.qualifierGroups && tournament.qualifierGroups.length > 0 && (
            <Link
              to={`/tournaments/${id}/groups`}
              className="mt-4 inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Trophy size={18} />
              View Lobby Scoreboards <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* Rules */}
      {tournament.rules && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Rules & Regulations</h2>
          </div>
          
          <div className="space-y-6">
            {/* Parse and format rules */}
            {(() => {
              const rulesText = tournament.rules || '';
              
              // Remove Points System section if present
              let cleanedRules = rulesText.replace(
                /Points System:[\s\S]*?11th\/12th place: 0 points/i,
                ''
              ).replace(
                /Tiebreakers:[\s\S]*?before the last game/i,
                ''
              ).trim();
              
              // Split rules into sections
              const sections: { title: string; content: string[] }[] = [];
              let currentSection: { title: string; content: string[] } | null = null;
              
              const lines = cleanedRules.split('\n').filter(line => line.trim());
              
              lines.forEach(line => {
                const trimmed = line.trim();
                // Check if it's a section title (ends with colon and doesn't start with bullet or number)
                if (
                  trimmed.endsWith(':') && 
                  trimmed.length > 2 && 
                  trimmed.length < 60 &&
                  !trimmed.startsWith('•') &&
                  !trimmed.startsWith('-') &&
                  !trimmed.match(/^\d+\./) &&
                  (trimmed[0] === trimmed[0].toUpperCase() || trimmed.match(/^[A-Z][a-z]+/))
                ) {
                  if (currentSection) {
                    sections.push(currentSection);
                  }
                  currentSection = {
                    title: trimmed.replace(/[:.]$/, ''),
                    content: []
                  };
                } else if (currentSection) {
                  if (trimmed && trimmed !== ':') {
                    currentSection.content.push(trimmed);
                  }
                } else {
                  // No section yet, create a general rules section
                  if (!currentSection) {
                    currentSection = { title: 'Rules', content: [] };
                  }
                  if (trimmed && trimmed !== ':') {
                    currentSection.content.push(trimmed);
                  }
                }
              });
              
              if (currentSection && currentSection.content.length > 0) {
                sections.push(currentSection);
              }
              
              // If no sections found, display as simple rules
              if (sections.length === 0) {
                const allRules = cleanedRules.split('\n').filter(line => line.trim() && line.trim() !== ':');
                if (allRules.length > 0) {
                  sections.push({
                    title: 'Rules',
                    content: allRules
                  });
                }
              }
              
              return sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-lg font-bold text-primary border-b-2 border-primary/30 pb-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-2.5 ml-1">
                    {section.content.map((rule, ruleIdx) => {
                      // Remove bullet points if already present
                      const cleanRule = rule.replace(/^[•\-\*]\s*/, '').trim();
                      if (!cleanRule || cleanRule === ':') return null;
                      
                      // Check if it's an important rule (starts with "No", "Banned", etc.)
                      const isProhibition = cleanRule.toLowerCase().startsWith('no ') || 
                                           cleanRule.toLowerCase().includes('banned') ||
                                           cleanRule.toLowerCase().includes('cannot') ||
                                           cleanRule.toLowerCase().includes('punish') ||
                                           cleanRule.toLowerCase().includes('disqualif');
                      
                      const isImportant = cleanRule.toLowerCase().includes('required') ||
                                         cleanRule.toLowerCase().includes('expected') ||
                                         cleanRule.toLowerCase().includes('must');
                      
                      return (
                        <li 
                          key={ruleIdx}
                          className={`flex items-start gap-3 ${
                            isProhibition 
                              ? 'text-red-300 font-medium' 
                              : isImportant
                              ? 'text-yellow-300 font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span className={`mt-1 flex-shrink-0 ${
                            isProhibition ? 'text-red-500' : 'text-primary'
                          }`}>
                            {isProhibition ? '✗' : '•'}
                          </span>
                          <span className="flex-1 leading-relaxed">{cleanRule}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Point System */}
      {tournament.pointsSystem && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Point System</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Placement Points</h3>
              <div className="grid grid-cols-4 gap-2">
                {tournament.pointsSystem?.placementPoints && Object.keys(tournament.pointsSystem.placementPoints).length > 0 ? (
                  Object.entries(tournament.pointsSystem.placementPoints).map(([place, points]) => (
                    <div 
                      key={place}
                      className="bg-background p-2 rounded border border-border text-center"
                    >
                      <p className="text-xs text-muted-foreground">#{place}</p>
                      <p className="font-bold">{points as number}pts</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-4">No placement points configured</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Kill Points</h3>
              <div className="bg-background p-4 rounded border border-border">
                <p className="text-3xl font-bold">{tournament.pointsSystem?.killPoints || 1}</p>
                <p className="text-sm text-muted-foreground">Points per kill</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard - Game by Game Results */}
      {(tournament.status === 'locked' || tournament.status === 'ongoing' || tournament.status === 'completed') && (
        <div className="mb-8">
          <Scoreboard tournament={tournament} />
        </div>
      )}

      {/* Tournament Bracket - Qualification Phase Only */}
      {(tournament.status === 'locked' || tournament.status === 'ongoing' || tournament.status === 'completed') && 
       tournament.hasQualifiers && 
       tournament.qualifierGroups && 
       tournament.qualifierGroups.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <TournamentBracket tournament={tournament} />
        </div>
      )}

      {/* Registered Teams */}
      {tournament.registeredTeams && tournament.registeredTeams.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <button
            onClick={() => setExpandedTeams(!expandedTeams)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={24} />
              <h2 className="text-xl font-bold">{t('tournament.details.registered.teams')} ({tournament.registeredTeams.length})</h2>
            </div>
            {expandedTeams ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {/* Message pour l'équipe inscrite */}
          {isRegistered && (
            <div className="mb-4 flex items-center gap-2 text-green-500 px-4 py-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle2 size={20} />
              <span className="font-semibold">{t('tournament.register.already.registered')}</span>
            </div>
          )}

          {expandedTeams && (
            <div className="space-y-3">
              {tournament.registeredTeams.map((registration: any, idx: number) => {
                const isUserTeam = registration.team?._id === user?.teamId || registration.team === user?.teamId;
                const participatingPlayers = registration.participatingPlayers || [];
                
                return (
                  <div
                    key={registration._id || idx}
                    className={`p-3 rounded ${
                      isUserTeam 
                        ? 'bg-green-500/10 border-2 border-green-500/30' 
                        : 'bg-background border border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground text-xs">#{idx + 1}</span>
                      <Link
                        to={`/teams/${registration.team?._id || registration.team}`}
                        className="flex-1 flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <span className="font-semibold">{registration.team?.name || 'Unknown'}</span>
                        {registration.team?.tag && (
                          <span className="text-xs text-muted-foreground">[{registration.team.tag}]</span>
                        )}
                      </Link>
                      {registration.checkedIn && (
                        <span className="text-xs text-green-500 font-semibold px-2 py-1 bg-green-500/20 rounded">
                          {t('tournament.details.checked.in')}
                        </span>
                      )}
                      {isUserTeam && (
                        <CheckCircle2 size={16} className="text-green-500" />
                      )}
                    </div>

                    {/* Participating Players */}
                    {participatingPlayers.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                          Playing ({participatingPlayers.length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {participatingPlayers.map((player: any, pIdx: number) => {
                            const playerData = typeof player.player === 'object' ? player.player : null;
                            const playerName = playerData?.username || playerData?.profile?.ign || 'Unknown';
                            const isGuest = player.isGuest;
                            
                            return (
                              <div
                                key={pIdx}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                  isGuest
                                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                    : 'bg-muted border border-border/50'
                                }`}
                                title={isGuest ? 'Guest Player' : player.role || 'Player'}
                              >
                                <span className="font-medium">{playerName}</span>
                                {isGuest && (
                                  <span className="text-[10px] text-blue-400">[Guest]</span>
                                )}
                                {player.role && (
                                  <span className="text-[10px] text-muted-foreground">• {player.role}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Guest Players Pending */}
                    {registration.guestPlayers && registration.guestPlayers.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                          Guest Invites:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {registration.guestPlayers
                            .filter((gp: any) => gp.inviteStatus === 'pending')
                            .map((guest: any, gIdx: number) => {
                              const guestData = typeof guest.player === 'object' ? guest.player : null;
                              const guestName = guestData?.username || guestData?.profile?.ign || 'Unknown';
                              
                              return (
                                <div
                                  key={gIdx}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                                  title={`Pending invite - ${guest.role || 'Player'}`}
                                >
                                  <span className="font-medium">{guestName}</span>
                                  <span className="text-[10px]">[Pending]</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Standings (if completed) */}
      {tournament.standings && tournament.standings.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold">Final Standings</h2>
          </div>
          
          <div className="space-y-2">
            {tournament.standings
              .slice()
              .sort((a: any, b: any) => {
                // Trier par totalPoints décroissant (du plus haut au plus bas)
                const aPoints = a?.totalPoints || 0;
                const bPoints = b?.totalPoints || 0;
                if (bPoints !== aPoints) return bPoints - aPoints;
                // En cas d'égalité, trier par avgPlacement croissant (meilleur placement = plus petit nombre)
                const aPlacement = a?.avgPlacement || 999;
                const bPlacement = b?.avgPlacement || 999;
                return aPlacement - bPlacement;
              })
              .slice(0, 10)
              .map((standing: any, idx: number) => (
              <div 
                key={standing._id}
                className={`flex items-center justify-between p-4 rounded border ${
                  idx === 0 ? 'border-yellow-500 bg-yellow-500/5' :
                  idx === 1 ? 'border-gray-400 bg-gray-400/5' :
                  idx === 2 ? 'border-orange-500 bg-orange-500/5' :
                  'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${
                    idx === 0 ? 'text-yellow-500' :
                    idx === 1 ? 'text-gray-400' :
                    idx === 2 ? 'text-orange-500' :
                    'text-muted-foreground'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div>
                    <p className="font-bold text-lg">{standing.team?.name || 'Unknown'}</p>
                    {standing.team?.tag && (
                      <p className="text-sm text-muted-foreground">[{standing.team.tag}]</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold">{standing.totalPoints} pts</p>
                  {standing.earnings > 0 && (
                    <p className="text-sm font-semibold text-green-500">
                      ${standing.earnings.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {standing.totalKills} kills • Avg #{standing.avgPlacement?.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
