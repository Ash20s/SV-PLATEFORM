import api from './api';
import type { PlayerStats, TeamStats } from '@/types';

export const statsService = {
  async getPlayerStats(
    id: string,
    period: string = 'alltime'
  ): Promise<{ stats: PlayerStats }> {
    const response = await api.get(`/stats/players/${id}`, { params: { period } });
    return response.data;
  },

  async getTeamStats(id: string, period: string = 'alltime'): Promise<{ stats: TeamStats }> {
    const response = await api.get(`/stats/teams/${id}`, { params: { period } });
    return response.data;
  },

  async getLeaderboard(params?: {
    type?: 'teams' | 'players';
    metric?: string;
    region?: string;
    limit?: number;
  }): Promise<{ leaderboard: any[]; type: string; metric: string }> {
    const response = await api.get('/stats/leaderboard', { params });
    return response.data;
  },
};
