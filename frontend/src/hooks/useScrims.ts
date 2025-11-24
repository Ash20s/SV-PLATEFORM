import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scrimService } from '@/services/scrimService';

export const useScrim = (id: string) => {
  return useQuery({
    queryKey: ['scrim', id],
    queryFn: () => scrimService.getScrim(id),
    enabled: !!id,
  });
};

export const useConfirmScrim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scrimId: string) => scrimService.confirmScrim(scrimId),
    onSuccess: (_, scrimId) => {
      queryClient.invalidateQueries({ queryKey: ['scrim', scrimId] });
      queryClient.invalidateQueries({ queryKey: ['scrims'] });
    },
  });
};
