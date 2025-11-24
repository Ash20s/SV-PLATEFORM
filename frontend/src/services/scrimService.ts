import api from './api';
import type { Scrim, PaginatedResponse } from '@/types';

export const scrimService = {
  async getScrims(params?: {
    status?: string;
    region?: string;
    teamId?: string;
    upcoming?: boolean;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<Scrim>> {
    const response = await api.get<PaginatedResponse<Scrim>>('/scrims', { params });
    return response.data;
  },

  async getScrim(id: string): Promise<{ scrim: Scrim }> {
    const response = await api.get(`/scrims/${id}`);
    return response.data;
  },

  async createScrim(data: {
    date: string;
    time: string;
    region: string;
    numberOfGames?: number;
    maxTeams?: number;
    notes?: string;
  }): Promise<{ scrim: Scrim }> {
    const response = await api.post('/scrims', data);
    return response.data;
  },

  async updateScrim(id: string, data: Partial<Scrim>): Promise<{ scrim: Scrim }> {
    const response = await api.put(`/scrims/${id}`, data);
    return response.data;
  },

  async confirmScrim(id: string): Promise<{ scrim: Scrim }> {
    const response = await api.put(`/scrims/${id}/confirm`);
    return response.data;
  },

  async updateResults(
    id: string,
    data: {
      gameNumber: number;
      results: { teamId: string; placement: number; kills: number }[];
      mapName?: string;
      vodLink?: string;
    }
  ): Promise<{ scrim: Scrim }> {
    const response = await api.put(`/scrims/${id}/results`, data);
    return response.data;
  },

  async deleteScrim(id: string): Promise<void> {
    await api.delete(`/scrims/${id}`);
  },
};
