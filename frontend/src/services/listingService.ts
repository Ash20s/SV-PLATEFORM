import api from './api';
import type { Listing, PaginatedResponse } from '@/types';

export const listingService = {
  async getListings(params?: {
    type?: string;
    region?: string;
    role?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<PaginatedResponse<Listing>>('/listings', { params });
    return response.data;
  },

  async getListing(id: string): Promise<{ listing: Listing }> {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  async createListing(data: Partial<Listing>): Promise<{ listing: Listing }> {
    const response = await api.post('/listings', data);
    return response.data;
  },

  async updateListing(id: string, data: Partial<Listing>): Promise<{ listing: Listing }> {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/listings/${id}`);
  },

  async closeListing(id: string): Promise<{ listing: Listing }> {
    const response = await api.patch(`/listings/${id}/close`);
    return response.data;
  },
};
