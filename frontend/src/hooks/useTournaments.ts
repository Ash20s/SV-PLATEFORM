import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentService } from '@/services/tournamentService';

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentService.getTournament(id),
    enabled: !!id,
  });
};

export const useRegisterTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tournamentId: string) => tournamentService.registerTeam(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};







