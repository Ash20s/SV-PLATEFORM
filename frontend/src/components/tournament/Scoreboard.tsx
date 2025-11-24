import React from 'react';
import { Trophy } from 'lucide-react';

interface ScoreboardProps {
  tournament: any;
}

export default function Scoreboard({ tournament }: ScoreboardProps) {
  if (!tournament) return null;

  const allGames = Array.isArray(tournament.games) ? tournament.games.sort((a: any, b: any) => 
    (a.gameNumber || 0) - (b.gameNumber || 0)
  ) : [];
  const registeredTeams = Array.isArray(tournament.registeredTeams) ? tournament.registeredTeams : [];
  
  // Games published in scoreboard (only these are visible)
  const publishedGames = Array.isArray(tournament.publishedGames) ? tournament.publishedGames : [];
  
  // Nombre total de games prévus (par défaut 6 ou 8)
  const totalGames = tournament.numberOfGames || 6;
  
  // Créer un tableau de toutes les games (jouées + non jouées)
  // Mais ne montrer les données que pour les games publiées
  const allGamesSlots = Array.from({ length: totalGames }, (_, index) => {
    const gameNumber = index + 1;
    const playedGame = allGames.find((g: any) => (g.gameNumber || 0) === gameNumber);
    const isPublished = publishedGames.includes(gameNumber);
    return {
      gameNumber,
      isPlayed: !!playedGame,
      isPublished: isPublished,  // Only published games show data
      game: playedGame || null,
    };
  });

  // Créer un objet pour accumuler les scores par équipe
  const teamScores: Record<string, {
    team: any;
    games: Array<{ placement: number; kills: number; placementPoints: number; killPoints: number; totalPoints: number }>;
    totalPlacementPoints: number;
    totalKillPoints: number;
    totalPoints: number;
  }> = {};

  // Initialiser toutes les équipes
  registeredTeams.forEach((reg: any) => {
    const teamId = reg.team?._id?.toString() || reg.team?.toString();
    if (teamId) {
      teamScores[teamId] = {
        team: reg.team,
        games: [],
        totalPlacementPoints: 0,
        totalKillPoints: 0,
        totalPoints: 0,
      };
    }
  });

  // Remplir les scores game par game (uniquement pour les games PUBLIÉS)
  allGames.forEach((game: any) => {
    if (!game.results || !Array.isArray(game.results)) {
      return;
    }

    const gameNumber = game.gameNumber || 0;
    
    // Only process published games
    if (!publishedGames.includes(gameNumber)) {
      return;
    }

    const slotIndex = gameNumber - 1; // Index dans le tableau (0-based)

    game.results.forEach((result: any) => {
      const teamId = result.team?._id?.toString() || result.team?.toString();
      if (teamId && teamScores[teamId]) {
        teamScores[teamId].games[slotIndex] = {
          placement: result.placement || 0,
          kills: result.kills || 0,
          placementPoints: result.placementPoints || 0,
          killPoints: result.killPoints || 0,
          totalPoints: result.totalPoints || 0,
          isPlayed: true,
          isPublished: true,
        };
      }
    });

    // Pour les équipes qui n'ont pas de résultat dans ce game publié
    Object.keys(teamScores).forEach((teamId) => {
      if (!teamScores[teamId].games[slotIndex]) {
        teamScores[teamId].games[slotIndex] = {
          placement: 0,
          kills: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0,
          isPlayed: true,
          isPublished: true,
        };
      }
    });
  });
  
  // Initialiser les slots non joués avec des valeurs nulles
  Object.keys(teamScores).forEach((teamId) => {
    for (let i = 0; i < totalGames; i++) {
      if (!teamScores[teamId].games[i]) {
        teamScores[teamId].games[i] = {
          placement: 0,
          kills: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0,
          isPlayed: false,
        };
      }
    }
  });

  // Calculer les totaux uniquement sur les games PUBLIÉS
  Object.keys(teamScores).forEach((teamId) => {
    const teamData = teamScores[teamId];
    teamData.totalPlacementPoints = teamData.games
      .filter((g: any) => g.isPublished)
      .reduce((sum: number, game: any) => sum + (game.placementPoints || 0), 0);
    teamData.totalKillPoints = teamData.games
      .filter((g: any) => g.isPublished)
      .reduce((sum: number, game: any) => sum + (game.killPoints || 0), 0);
    teamData.totalPoints = teamData.games
      .filter((g: any) => g.isPublished)
      .reduce((sum: number, game: any) => sum + (game.totalPoints || 0), 0);
  });

  // Convertir en tableau et trier par totalPoints décroissant
  const sortedTeams = Object.values(teamScores).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return a.totalPlacementPoints - b.totalPlacementPoints; // En cas d'égalité, meilleur placement
  });

  if (sortedTeams.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground text-center">No teams registered yet</p>
      </div>
    );
  }

  const getPlacementColor = (placement: number) => {
    if (placement <= 3) return 'bg-green-500/20 text-green-400 border-green-500/40';
    if (placement <= 8) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          <h2 className="text-xl font-bold">Scoreboard</h2>
          {publishedGames.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              (Showing {publishedGames.length} / {totalGames} games)
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              (No scores published yet)
            </span>
          )}
        </div>
      </div>

      <div className="min-w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-semibold sticky left-0 bg-card z-10">Team</th>
              {allGamesSlots.map((slot, idx: number) => (
                <th 
                  key={idx} 
                  colSpan={2} 
                  className={`text-center p-3 font-semibold border-l border-border ${
                    !slot.isPlayed ? 'opacity-50' : ''
                  }`}
                >
                  Game {slot.gameNumber}
                  {!slot.isPlayed && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(Not played)</span>
                  )}
                  {slot.isPlayed && !slot.isPublished && (
                    <span className="ml-1 text-xs font-normal text-orange-400">(Not published)</span>
                  )}
                </th>
              ))}
              <th colSpan={3} className="text-center p-3 font-semibold border-l-2 border-primary/50 bg-primary/5">
                Total
              </th>
            </tr>
            <tr className="border-b-2 border-border bg-muted/30">
              <th className="text-left p-2 text-xs text-muted-foreground sticky left-0 bg-card z-10"></th>
              {allGamesSlots.map((slot, idx: number) => (
                <React.Fragment key={idx}>
                  <th className={`text-center p-2 text-xs text-muted-foreground border-l border-border w-20 ${
                    !slot.isPlayed ? 'opacity-50' : ''
                  }`}>Place</th>
                  <th className={`text-center p-2 text-xs text-muted-foreground w-20 ${
                    !slot.isPlayed ? 'opacity-50' : ''
                  }`}>Kills</th>
                </React.Fragment>
              ))}
              <th className="text-center p-2 text-xs text-muted-foreground border-l-2 border-primary/50 bg-primary/5 w-24">
                Placement Pts
              </th>
              <th className="text-center p-2 text-xs text-muted-foreground bg-primary/5 w-24">Kill Pts</th>
              <th className="text-center p-2 text-xs text-muted-foreground bg-primary/5 w-24 font-bold">
                Total Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((teamData, idx: number) => {
              const team = teamData.team;
              const teamName = typeof team === 'object' ? (team?.name || 'Unknown') : 'Unknown';
              const teamTag = typeof team === 'object' ? team?.tag : null;
              const isTop3 = idx < 3;

              return (
                <tr
                  key={idx}
                  className={`border-b border-border hover:bg-accent/50 ${
                    isTop3 ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-3 sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm w-6 ${
                        idx === 0 ? 'text-yellow-500' :
                        idx === 1 ? 'text-gray-400' :
                        idx === 2 ? 'text-orange-500' :
                        'text-muted-foreground'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{teamName}</div>
                        {teamTag && (
                          <div className="text-xs text-muted-foreground">[{teamTag}]</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {allGamesSlots.map((slot, gameIdx: number) => {
                    const gameResult = teamData.games[gameIdx];
                    const placement = gameResult?.placement || 0;
                    const kills = gameResult?.kills || 0;
                    const isPublished = slot.isPublished && gameResult?.isPublished;

                    // Show data only if published
                    const showData = isPublished;

                    return (
                      <React.Fragment key={gameIdx}>
                        <td className={`text-center p-2 border-l border-border ${
                          showData 
                            ? getPlacementColor(placement)
                            : slot.isPlayed && !slot.isPublished
                            ? 'opacity-30 bg-orange-500/10 text-muted-foreground'
                            : 'opacity-40 bg-muted/20 text-muted-foreground'
                        }`}>
                          {showData && placement > 0 ? placement : '-'}
                        </td>
                        <td className={`text-center p-2 ${
                          !showData ? 'opacity-40 text-muted-foreground' : ''
                        }`}>
                          {showData && kills > 0 ? kills : '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="text-center p-2 font-semibold border-l-2 border-primary/50 bg-primary/5">
                    {teamData.totalPlacementPoints}
                  </td>
                  <td className="text-center p-2 font-semibold bg-primary/5">
                    {teamData.totalKillPoints}
                  </td>
                  <td className={`text-center p-2 font-bold bg-primary/5 ${
                    isTop3 ? 'text-primary text-lg' : ''
                  }`}>
                    {teamData.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

