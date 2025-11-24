import api from './api';
import type { Tournament, PaginatedResponse } from '@/types';

export const tournamentService = {
  async getTournaments(params?: {
    status?: string;
    upcoming?: boolean;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<Tournament>> {
    const response = await api.get<PaginatedResponse<Tournament>>('/tournaments', { params });
    return response.data;
  },

  async getTournament(id: string): Promise<{ tournament: Tournament }> {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  async createTournament(data: Partial<Tournament>): Promise<{ tournament: Tournament }> {
    const response = await api.post('/tournaments', data);
    return response.data;
  },

  async registerTeam(id: string): Promise<{ tournament: Tournament }> {
    const response = await api.post(`/tournaments/${id}/register`);
    return response.data;
  },

  async updateBrackets(
    id: string,
    data: {
      gameNumber: number;
      results: { teamId: string; placement: number; kills: number }[];
      mapName?: string;
      vodLink?: string;
      date?: string;
    }
  ): Promise<{ tournament: Tournament }> {
    const response = await api.put(`/tournaments/${id}/brackets`, data);
    return response.data;
  },

  async lockTournament(id: string): Promise<{ tournament: Tournament }> {
    const response = await api.put(`/tournaments/${id}/lock`);
    return response.data;
  },

  async unlockTournament(id: string): Promise<{ tournament: Tournament }> {
    const response = await api.put(`/tournaments/${id}/unlock`);
    return response.data;
  },

  async publishScores(id: string): Promise<{ tournament: Tournament; message: string; newlyPublished: number[] }> {
    const response = await api.post(`/tournaments/${id}/publish-scores`);
    return response.data;
  },

  async resetScores(id: string): Promise<{ tournament: Tournament; message: string }> {
    const response = await api.delete(`/tournaments/${id}/reset-scores`);
    return response.data;
  },
};
