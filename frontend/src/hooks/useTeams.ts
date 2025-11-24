import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/teamService';

export const useTeams = (params?: any) => {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamService.getTeams(params),
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: () => {
      // Invalider toutes les requêtes liées aux équipes
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teamService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useRefreshTeamStats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.refreshTeamStats(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
