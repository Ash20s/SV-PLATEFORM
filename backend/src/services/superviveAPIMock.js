// Service Mock de l'API Supervive pour tests et développement
// Simule les réponses de l'API selon le schéma de Zendrex

class SuperviveAPIMock {
  constructor() {
    this.matches = [];
    this.matchCounter = 0;
    this.players = new Map();
    this.teams = new Map();
    this.initializeMockData();
  }

  /**
   * Initialise des données de test réalistes
   */
  initializeMockData() {
    // Créer des joueurs de test
    const playerNames = [
      { id: 'player_001', name: 'TheGhost', tag: 'GHOST' },
      { id: 'player_002', name: 'ShadowHunter', tag: 'SHADOW' },
      { id: 'player_003', name: 'FrostBite', tag: 'FROST' },
      { id: 'player_004', name: 'FireStorm', tag: 'FIRE' },
      { id: 'player_005', name: 'ThunderBolt', tag: 'THUNDER' },
      { id: 'player_006', name: 'IceQueen', tag: 'ICE' },
      { id: 'player_007', name: 'DarkKnight', tag: 'DARK' },
      { id: 'player_008', name: 'LightBringer', tag: 'LIGHT' },
    ];

    playerNames.forEach(p => {
      this.players.set(p.id, p);
    });

    // Créer quelques matches de test
    this.generateMockMatches(5);
  }

  /**
   * Génère des matches de test
   */
  generateMockMatches(count = 5) {
    const heroes = ['Hunter_001', 'Hunter_002', 'Hunter_003', 'Hunter_004', 'Hunter_005'];
    const regions = ['us-east-2', 'eu-west-1', 'asia-pacific-1'];
    
    for (let i = 0; i < count; i++) {
      const matchDate = new Date(Date.now() - i * 3600000); // 1 heure entre chaque match
      const match = this.createMockMatch(matchDate, heroes, regions);
      this.matches.push(match);
    }
  }

  /**
   * Crée un match mock selon le schéma de Zendrex
   */
  createMockMatch(matchDate, heroes, regions) {
    this.matchCounter++;
    const matchId = `match_${Date.now()}_${this.matchCounter}`;
    const numTeams = 12;
    const maxTeamSize = 3;
    const numParticipants = numTeams * maxTeamSize;
    const region = regions[Math.floor(Math.random() * regions.length)];

    // Créer des équipes
    const teams = [];
    const allPlayers = Array.from(this.players.values());
    
    for (let teamIdx = 0; teamIdx < numTeams; teamIdx++) {
      const teamId = `team_${matchId}_${teamIdx}`;
      const teamPlayers = [];
      
      // Sélectionner 3 joueurs aléatoires pour l'équipe
      const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());
      for (let i = 0; i < maxTeamSize; i++) {
        const player = shuffled[i];
        teamPlayers.push({
          HeroAssetID: heroes[Math.floor(Math.random() * heroes.length)],
          TeamID: teamId,
          ID: player.id,
          DisplayName: player.name,
          Tag: player.tag,
          Region: region,
          IsRanked: true,
          Rank: ['Unranked', 'Bronze', 'Silver', 'Gold'][Math.floor(Math.random() * 4)],
          RankRating: Math.floor(Math.random() * 2000) + 1000,
        });
      }
      
      teams.push({
        teamId,
        players: teamPlayers,
        placement: teamIdx + 1, // Sera randomisé après
      });
    }

    // Randomiser les placements
    teams.sort(() => 0.5 - Math.random());
    teams.forEach((team, idx) => {
      team.placement = idx + 1;
    });

    // Créer les stats des joueurs
    const playerMatchDetails = {};
    const teamMatchDetails = [];

    teams.forEach(team => {
      teamMatchDetails.push({
        TeamID: team.teamId,
        Placement: team.placement
      });

      team.players.forEach(player => {
        const placement = team.placement;
        const isWinner = placement === 1;
        
        // Générer des stats réalistes selon le placement
        const baseKills = isWinner ? 8 : Math.max(0, 8 - placement);
        const baseDamage = isWinner ? 70000 : Math.max(10000, 70000 - placement * 5000);
        const baseAssists = Math.floor(Math.random() * 5);
        const deaths = placement <= 3 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 1;

        playerMatchDetails[player.ID] = {
          PlayerID: player.ID,
          DisplayName: player.DisplayName,
          Tag: player.Tag,
          HeroAssetID: player.HeroAssetID,
          TeamID: team.teamId,
          Placement: placement,
          SurvivalDuration: Math.floor(Math.random() * 1200) + 300, // 5-25 minutes
          CharacterLevel: Math.floor(Math.random() * 10) + 10,
          PlayerMatchStats: {
            ArmorMitigatedDamage: Math.floor(Math.random() * 5000),
            Assists: baseAssists,
            CreepKills: Math.floor(Math.random() * 20),
            DamageDone: baseDamage + Math.floor(Math.random() * 10000),
            DamageTaken: Math.floor(Math.random() * 30000),
            Deaths: deaths,
            EffectiveDamageDone: baseDamage + Math.floor(Math.random() * 5000),
            EffectiveDamageTaken: Math.floor(Math.random() * 20000),
            GoldFromEnemies: Math.floor(Math.random() * 500),
            GoldFromMonsters: Math.floor(Math.random() * 300),
            GoldFromTreasure: Math.floor(Math.random() * 200),
            HealingGiven: Math.floor(Math.random() * 5000),
            HealingGivenSelf: Math.floor(Math.random() * 3000),
            HealingReceived: Math.floor(Math.random() * 4000),
            HeroDamageDone: baseDamage + Math.floor(Math.random() * 5000),
            HeroDamageTaken: Math.floor(Math.random() * 25000),
            HeroEffectiveDamageDone: baseDamage + Math.floor(Math.random() * 3000),
            HeroEffectiveDamageTaken: Math.floor(Math.random() * 15000),
            Kills: baseKills + Math.floor(Math.random() * 3),
            Knocked: Math.floor(Math.random() * 5),
            Knocks: Math.floor(Math.random() * 8),
            MaxKillStreak: Math.floor(Math.random() * 5) + 1,
            MaxKnockStreak: Math.floor(Math.random() * 3) + 1,
            Resurrected: placement <= 5 ? Math.floor(Math.random() * 2) : 0,
            Resurrects: placement <= 5 ? Math.floor(Math.random() * 2) : 0,
            Revived: placement <= 5 ? Math.floor(Math.random() * 2) : 0,
            Revives: placement <= 5 ? Math.floor(Math.random() * 2) : 0,
            ShieldMitigatedDamage: Math.floor(Math.random() * 3000),
          }
        };
      });
    });

    // Créer les participants
    const participants = teams.flatMap(team => team.players);

    const matchStart = new Date(matchDate);
    const matchEnd = new Date(matchDate.getTime() + (20 + Math.random() * 10) * 60000); // 20-30 minutes

    return {
      MatchID: matchId,
      MatchDetails: {
        MatchStart: matchStart.toISOString(),
        MatchEnd: matchEnd.toISOString(),
        NumParticipants: numParticipants,
        NumTeams: numTeams,
        MaxTeamSize: maxTeamSize,
        ConnectionDetails: {
          Region: region,
        },
        Participants: participants,
      },
      TeamMatchDetails: teamMatchDetails,
      PlayerMatchDetails: playerMatchDetails,
    };
  }

  /**
   * Simule getMatches de l'API
   */
  async getMatches(since = null, limit = 50) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));

    let filteredMatches = [...this.matches];

    if (since) {
      filteredMatches = filteredMatches.filter(m => {
        const matchDate = new Date(m.MatchDetails.MatchStart);
        return matchDate >= since;
      });
    }

    // Trier par date décroissante
    filteredMatches.sort((a, b) => {
      const dateA = new Date(a.MatchDetails.MatchStart);
      const dateB = new Date(b.MatchDetails.MatchStart);
      return dateB - dateA;
    });

    return filteredMatches.slice(0, limit);
  }

  /**
   * Simule getMatchDetails de l'API
   */
  async getMatchDetails(matchId) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 50));

    const match = this.matches.find(m => m.MatchID === matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    return match;
  }

  /**
   * Ajoute un match de test
   */
  addMockMatch(matchData = null) {
    const heroes = ['Hunter_001', 'Hunter_002', 'Hunter_003', 'Hunter_004', 'Hunter_005'];
    const regions = ['us-east-2', 'eu-west-1', 'asia-pacific-1'];
    
    const match = matchData || this.createMockMatch(new Date(), heroes, regions);
    this.matches.unshift(match); // Ajouter au début
    return match;
  }

  /**
   * Réinitialise les données de test
   */
  reset() {
    this.matches = [];
    this.matchCounter = 0;
    this.initializeMockData();
  }

  /**
   * Retourne les statistiques du mock
   */
  getStats() {
    return {
      totalMatches: this.matches.length,
      totalPlayers: this.players.size,
      latestMatch: this.matches[0]?.MatchID || null,
      oldestMatch: this.matches[this.matches.length - 1]?.MatchID || null,
    };
  }
}

module.exports = new SuperviveAPIMock();

