import { Trophy, CheckCircle2 } from 'lucide-react';
import { Tournament } from '@/types';

interface TournamentBracketProps {
  tournament: Tournament;
}

export default function TournamentBracket({ tournament }: TournamentBracketProps) {
  if (!tournament) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
        <p className="text-yellow-300/80">Tournament data not available</p>
      </div>
    );
  }

  try {
    const isLocked = tournament.status === 'locked' || tournament.status === 'ongoing' || tournament.status === 'completed';
    const hasQualifiers = tournament.hasQualifiers && tournament.qualifierGroups && Array.isArray(tournament.qualifierGroups) && tournament.qualifierGroups.length > 0;
    const qualifierGroups = Array.isArray(tournament.qualifierGroups) ? tournament.qualifierGroups : [];

    // Si le tournoi n'est pas locked, ne pas afficher le bracket
    if (!isLocked) {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
          <Trophy className="mx-auto text-yellow-500 mb-3" size={48} />
          <h3 className="text-xl font-bold text-yellow-500 mb-2">Bracket Not Available</h3>
          <p className="text-yellow-300/80">
            The bracket will be available once the tournament is locked and ready to start.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Qualification Phase */}
        {hasQualifiers && qualifierGroups.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Qualification Phase</h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualifierGroups.map((group: any, index: number) => {
              if (!group || typeof group !== 'object') return null;
              
              const groupStandings = Array.isArray(group.standings) ? group.standings : [];
              const sortedStandings = [...groupStandings].sort((a: any, b: any) => {
                const aPoints = a?.totalPoints || 0;
                const bPoints = b?.totalPoints || 0;
                if (bPoints !== aPoints) return bPoints - aPoints;
                const aPlacement = a?.avgPlacement || 999;
                const bPlacement = b?.avgPlacement || 999;
                return aPlacement - bPlacement;
              });

              const qualifiersCount = tournament.qualifierSettings?.qualifiersPerGroup || 0;

              return (
                <div
                  key={index}
                  className="bg-background border border-border rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary">{group.groupName}</h3>
                    <span className="text-xs text-muted-foreground">
                      {group.teams?.length || 0} teams
                    </span>
                  </div>

                  {/* Standings */}
                  <div className="space-y-2">
                    {sortedStandings.length > 0 ? (
                      sortedStandings.map((standing: any, idx: number) => {
                        if (!standing || typeof standing !== 'object') return null;
                        
                        const isQualified = idx < qualifiersCount;
                        const team = standing?.team || standing?.teamId;

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded ${
                              isQualified
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-background/50 border border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-bold text-sm w-6 text-center">
                                #{idx + 1}
                              </span>
                              {isQualified && (
                                <CheckCircle2 size={14} className="text-green-400" />
                              )}
                              <span className="font-semibold text-sm flex-1">
                                {typeof team === 'object' ? (team?.name || 'Unknown Team') : 'Unknown Team'}
                              </span>
                              {typeof team === 'object' && team?.tag && (
                                <span className="text-xs text-muted-foreground">
                                  [{team.tag}]
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  {standing?.totalPoints || 0}
                                </div>
                                <div className="text-muted-foreground">pts</div>
                              </div>
                              <div className="text-right w-12">
                                <div className="font-semibold">
                                  {standing?.totalKills || 0}
                                </div>
                                <div className="text-muted-foreground">kills</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No standings yet
                      </p>
                    )}
                  </div>

                  {/* Qualified indicator */}
                  {qualifiersCount > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Top <span className="font-bold text-primary">{qualifiersCount}</span> teams qualify
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* No bracket data for qualification */}
      {!hasQualifiers && qualifierGroups.length === 0 && tournament.status === 'locked' && (
        <div className="bg-background/50 border border-border rounded-lg p-6 text-center">
          <Trophy className="mx-auto text-muted-foreground mb-3" size={48} />
          <h3 className="text-lg font-bold mb-2">Qualification Data Not Available</h3>
          <p className="text-muted-foreground">
            Qualification groups will be generated once the tournament is locked.
          </p>
        </div>
      )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering TournamentBracket:', error);
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Bracket</h3>
        <p className="text-red-300/80">
          There was an error loading the tournament bracket. Please refresh the page.
        </p>
        <p className="text-xs text-red-400/60 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}

