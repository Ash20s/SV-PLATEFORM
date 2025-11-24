import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Play, Trophy, ChevronLeft, ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { useI18n } from '@/i18n/i18n';
import LobbyScoreboard from '@/components/tournament/LobbyScoreboard';

export default function TournamentGroups() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [selectedLobby, setSelectedLobby] = useState<string>('all'); // 'all', 'A', 'B', 'C', etc., or 'final'

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await api.get(`/tournaments/${id}`);
      return res.data;
    },
    staleTime: 30000, // Cache pendant 30 secondes
    refetchOnWindowFocus: false, // Pas de refetch automatique
  });

  const generateGroupsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tournaments/${id}/generate-groups`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('tournament.groups.loading')}</p>
        </div>
      </div>
    );
  }

  if (!tournament) return <div>{t('tournament.groups.not.found')}</div>;

  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const qualifierGroups = Array.isArray(tournament.qualifierGroups) ? tournament.qualifierGroups : [];
  const publishedGames = Array.isArray(tournament.publishedGames) ? tournament.publishedGames : [];
  const numberOfGames = tournament.qualifierSettings?.gamesPerGroup || tournament.numberOfGames || 6;
  
  // Déterminer le lobby actuellement sélectionné
  const currentLobby = selectedLobby === 'all' || selectedLobby === 'final' 
    ? null 
    : qualifierGroups.find((g: any, idx: number) => groupLetters[idx] === selectedLobby);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to={`/tournaments/${id}`}
            className="p-2 rounded hover:bg-accent transition-colors"
            title="Back to tournament"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-muted-foreground">Lobby Scoring & Standings</p>
          </div>
        </div>
        
        {tournament.hasQualifiers && !qualifierGroups.length && (
          <button
            onClick={() => generateGroupsMutation.mutate()}
            disabled={(tournament.registeredTeams?.length || 0) < (tournament.qualifierSettings?.numberOfGroups || 0)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('tournament.groups.generate')}
          </button>
        )}
      </div>

      {!tournament.hasQualifiers && (
        <div className="bg-card p-6 rounded-lg border border-border text-center">
          <p className="text-muted-foreground">{t('tournament.groups.no.qualifiers')}</p>
        </div>
      )}

      {tournament.hasQualifiers && (
        <div className="space-y-6">
          {/* Lobby Navigation Tabs */}
          {qualifierGroups.length > 0 && (
            <div className="bg-card p-2 rounded-lg border border-border">
              <div className="flex flex-wrap gap-2">
                {qualifierGroups.map((group: any, index: number) => {
                  const lobbyLetter = groupLetters[index];
                  const isSelected = selectedLobby === lobbyLetter;
                  const gamesCompleted = group.games?.filter((g: any) => g.status === 'completed').length || 0;
                  const totalGames = tournament.qualifierSettings?.gamesPerGroup || 6;
                  
                  return (
                    <button
                      key={group._id || index}
                      onClick={() => setSelectedLobby(lobbyLetter)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent text-foreground'
                      }`}
                    >
                      <Trophy size={18} />
                      Lobby {lobbyLetter}
                      <span className="text-xs opacity-75">({gamesCompleted}/{totalGames})</span>
                    </button>
                  );
                })}
                
                {/* Final Lobby Tab */}
                {tournament.qualifiedTeams && tournament.qualifiedTeams.length > 0 && (
                  <button
                    onClick={() => setSelectedLobby('final')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      selectedLobby === 'final'
                        ? 'bg-yellow-500/20 text-yellow-500 border-2 border-yellow-500/50'
                        : 'bg-background hover:bg-accent text-foreground border border-border'
                    }`}
                  >
                    <Trophy size={18} className="text-yellow-500" />
                    Final Lobby
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Final Lobby Content */}
          {selectedLobby === 'final' && tournament.qualifiedTeams && tournament.qualifiedTeams.length > 0 && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="text-yellow-500" size={24} />
                  <h2 className="text-2xl font-bold">Final Lobby</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tournament.qualifiedTeams?.length || 0} qualified teams competing for the championship
                </p>
              </div>
              
              {/* Final Lobby Scoreboard */}
              <LobbyScoreboard
                games={Array.isArray(tournament.games) ? tournament.games : []}
                teams={Array.isArray(tournament.qualifiedTeams) ? tournament.qualifiedTeams : []}
                publishedGames={publishedGames}
                numberOfGames={tournament.numberOfGames || 6}
              />
            </div>
          )}

          {/* Selected Qualification Lobby Content */}
          {currentLobby && selectedLobby !== 'all' && selectedLobby !== 'final' && (
            <div className="space-y-4">
              {(() => {
                const group = currentLobby;
                const lobbyIndex = qualifierGroups.findIndex((g: any) => (g._id || g) === (group._id || group));
                const lobbyLetter = lobbyIndex >= 0 ? groupLetters[lobbyIndex] : '?';
                
                return (
                  <div className="space-y-4">
                    <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{lobbyLetter}</span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Lobby {lobbyLetter}</h2>
                            <p className="text-sm text-muted-foreground">
                              {group.teams?.length || 0} teams • Top {tournament.qualifierSettings?.qualifiersPerGroup || 0} qualify
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Teams List */}
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users size={18} />
                        Teams in Lobby {lobbyLetter}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {group.teams?.map((team: any) => {
                          const teamObj = typeof team === 'object' ? team : null;
                          const teamName = teamObj?.name || 'Unknown Team';
                          const teamTag = teamObj?.tag;
                          return (
                            <div
                              key={teamObj?._id || team}
                              className="bg-background border border-border rounded p-2 text-sm"
                            >
                              <div className="font-semibold truncate">{teamName}</div>
                              {teamTag && (
                                <div className="text-xs text-muted-foreground">[{teamTag}]</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Lobby Scoreboard */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        Lobby {lobbyLetter} Scoreboard
                      </h3>
                      <LobbyScoreboard
                        games={Array.isArray(group.games) ? group.games : []}
                        teams={Array.isArray(group.teams) ? group.teams : []}
                        publishedGames={publishedGames}
                        numberOfGames={numberOfGames}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* All Lobbies Overview (if no specific lobby selected) */}
          {selectedLobby === 'all' && qualifierGroups.length > 0 && (
            <div className="grid gap-4">
              {qualifierGroups.map((group: any, index: number) => {
                const lobbyLetter = groupLetters[index];
                const gamesCompleted = group.games?.filter((g: any) => g.status === 'completed').length || 0;
                const totalGames = tournament.qualifierSettings?.gamesPerGroup || 6;
                
                return (
                  <div 
                    key={group._id || index}
                    onClick={() => setSelectedLobby(lobbyLetter)}
                    className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">{lobbyLetter}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Lobby {lobbyLetter}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.teams?.length || 0} teams • {gamesCompleted}/{totalGames} games completed • Click to view scoreboard
                          </p>
                        </div>
                      </div>
                      <ChevronLeft className="rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
