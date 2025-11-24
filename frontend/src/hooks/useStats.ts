import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/statsService';

export const usePlayerStats = (id: string, period: string = 'alltime') => {
  return useQuery({
    queryKey: ['playerStats', id, period],
    queryFn: () => statsService.getPlayerStats(id, period),
    enabled: !!id,
  });
};

export const useTeamStats = (id: string, period: string = 'alltime') => {
  return useQuery({
    queryKey: ['teamStats', id, period],
    queryFn: () => statsService.getTeamStats(id, period),
    enabled: !!id,
  });
};

export const useLeaderboard = (params?: any) => {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => statsService.getLeaderboard(params),
  });
};
