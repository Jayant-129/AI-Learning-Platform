import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../utils/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await dashboardAPI.getStats();
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
