import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementsAPI } from '../utils/api';
import { toast } from 'react-toastify';

// ---- Drives ----

export function useGetDrives() {
  return useQuery({
    queryKey: ['drives'],
    queryFn: async () => {
      const res = await placementsAPI.getDrives();
      return res.data;
    },
  });
}

export function useGetDrive(id) {
  return useQuery({
    queryKey: ['drive', id],
    queryFn: async () => {
      const res = await placementsAPI.getDrive(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => placementsAPI.createDrive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      toast.success('Placement drive created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    },
  });
}

export function useUpdateDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => placementsAPI.updateDrive(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      toast.success('Drive updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update drive');
    },
  });
}

export function useDeleteDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => placementsAPI.deleteDrive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      toast.success('Drive deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete drive');
    },
  });
}

// ---- Applications ----

export function useGetApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await placementsAPI.getApplications();
      return res.data;
    },
  });
}

export function useGetApplicationsByLearner(learnerId) {
  return useQuery({
    queryKey: ['applications', 'learner', learnerId],
    queryFn: async () => {
      const res = await placementsAPI.getApplicationsByLearner(learnerId);
      return res.data;
    },
    enabled: !!learnerId,
  });
}

export function useApplyToDrive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ learnerId, driveId }) => placementsAPI.apply(learnerId, driveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to apply');
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, result }) => placementsAPI.updateApplicationStatus(id, status, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}
