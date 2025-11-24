// Service de génération de posters/stats pour Twitch Live
// Génère des images avec les statistiques des joueurs/équipes

let canvas;
try {
  canvas = require('canvas');
} catch (error) {
  console.warn('⚠️  Canvas module not available. Poster generation will be disabled.');
  canvas = null;
}

const fs = require('fs').promises;
const path = require('path');

class PosterGeneratorService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../uploads/posters');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating posters directory:', error);
    }
  }

  /**
   * Génère un poster pour un joueur avec ses stats d'un match
   * @param {Object} playerData - Données du joueur
   * @param {Object} matchStats - Stats du match
   * @returns {Promise<string>} Chemin du fichier généré
   */
  async generatePlayerMatchPoster(playerData, matchStats) {
    if (!canvas) {
      throw new Error('Canvas module not available. Install canvas package to generate posters.');
    }

    const width = 1920;
    const height = 1080;

    const canvasInstance = canvas.createCanvas(width, height);
    const ctx = canvasInstance.getContext('2d');

    // Fond dégradé
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Titre
    ctx.fillStyle = '#00ffc6';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerData.displayName || playerData.playerName, width / 2, 120);

    // Sous-titre
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.fillText('Played a great game!', width / 2, 200);

    // Stats principales
    const statsY = 350;
    const statsSpacing = 100;

    // Damage
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Damage Dealt:', 200, statsY);
    ctx.fillStyle = '#ffffff';
    ctx.font = '56px Arial';
    ctx.fillText(
      this.formatNumber(matchStats.damageDealt || matchStats.damageDone || 0),
      200,
      statsY + statsSpacing
    );

    // Kills
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 64px Arial';
    ctx.fillText('Kills:', 200, statsY + statsSpacing * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '56px Arial';
    ctx.fillText(matchStats.kills || 0, 200, statsY + statsSpacing * 3);

    // Placement
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 64px Arial';
    ctx.fillText('Placement:', 200, statsY + statsSpacing * 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = '56px Arial';
    const placement = matchStats.placement || matchStats.finalPosition || 0;
    ctx.fillText(`#${placement}`, 200, statsY + statsY + statsSpacing * 5);

    // Stats secondaires (droite)
    const rightX = width - 400;
    ctx.fillStyle = '#95a5a6';
    ctx.font = '36px Arial';
    ctx.textAlign = 'right';

    if (matchStats.assists !== undefined) {
      ctx.fillText(`Assists: ${matchStats.assists}`, rightX, statsY);
    }
    if (matchStats.deaths !== undefined) {
      ctx.fillText(`Deaths: ${matchStats.deaths}`, rightX, statsY + 50);
    }
    if (matchStats.revives !== undefined) {
      ctx.fillText(`Revives: ${matchStats.revives}`, rightX, statsY + 100);
    }
    if (matchStats.healing !== undefined) {
      ctx.fillText(`Healing: ${this.formatNumber(matchStats.healing)}`, rightX, statsY + 150);
    }

    // Footer
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Match ID: ${matchStats.matchId || 'N/A'}`,
      width / 2,
      height - 40
    );

    // Sauvegarder
    const filename = `poster_${playerData.playerId || 'player'}_${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvasInstance.toBuffer('image/png');
    await fs.writeFile(filepath, buffer);

    return `/uploads/posters/${filename}`;
  }

  /**
   * Génère un poster pour l'équipe gagnante
   */
  async generateWinnerTeamPoster(teamData, matchStats) {
    if (!canvas) {
      throw new Error('Canvas module not available. Install canvas package to generate posters.');
    }

    const width = 1920;
    const height = 1080;

    const canvasInstance = canvas.createCanvas(width, height);
    const ctx = canvasInstance.getContext('2d');

    // Fond
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f093fb');
    gradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Titre
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 WINNERS 🏆', width / 2, 150);

    // Nom de l'équipe
    ctx.font = 'bold 72px Arial';
    ctx.fillText(teamData.name || 'Unknown Team', width / 2, 280);
    if (teamData.tag) {
      ctx.font = '48px Arial';
      ctx.fillText(`[${teamData.tag}]`, width / 2, 350);
    }

    // Stats de l'équipe
    const statsY = 500;
    ctx.font = 'bold 56px Arial';
    ctx.fillText(`Total Kills: ${matchStats.totalKills || 0}`, width / 2, statsY);
    ctx.fillText(`Total Damage: ${this.formatNumber(matchStats.totalDamage || 0)}`, width / 2, statsY + 80);
    ctx.fillText(`Placement: #${matchStats.placement || 1}`, width / 2, statsY + 160);

    // Joueurs
    if (teamData.players && teamData.players.length > 0) {
      ctx.font = '36px Arial';
      const playersText = teamData.players.map(p => p.displayName || p.playerName).join(', ');
      ctx.fillText(`Players: ${playersText}`, width / 2, statsY + 280);
    }

    // Sauvegarder
    const filename = `winner_${teamData.teamId || 'team'}_${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvasInstance.toBuffer('image/png');
    await fs.writeFile(filepath, buffer);

    return `/uploads/posters/${filename}`;
  }

  /**
   * Formate un nombre avec séparateurs
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

module.exports = new PosterGeneratorService();

