import api from './api';
import type { Team, PaginatedResponse } from '@/types';

export const teamService = {
  async getTeams(params?: {
    region?: string;
    search?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<Team>> {
    const response = await api.get<PaginatedResponse<Team>>('/teams', { params });
    return response.data;
  },

  async getTeam(id: string, refresh?: boolean): Promise<{ team: Team; stats: any }> {
    const response = await api.get(`/teams/${id}`, { params: { refresh: refresh ? 'true' : 'false' } });
    return response.data;
  },

  async refreshTeamStats(id: string): Promise<{ message: string; teamStats: any }> {
    const response = await api.post(`/teams/${id}/refresh-stats`);
    return response.data;
  },

  async createTeam(data: {
    name: string;
    tag: string;
    logo?: string;
    region: string;
    socials?: any;
  }): Promise<{ team: Team }> {
    const response = await api.post('/teams', data);
    return response.data;
  },

  async updateTeam(id: string, data: Partial<Team>): Promise<{ team: Team }> {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async updateRoster(
    id: string,
    data: { action: 'add' | 'remove'; playerId: string; role?: string }
  ): Promise<{ team: Team }> {
    const response = await api.post(`/teams/${id}/roster`, data);
    return response.data;
  },
};
