import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentsAPI } from '../utils/api';
import { toast } from 'react-toastify';

export function useGetAssessments() {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await assessmentsAPI.getAll();
      return res.data;
    },
  });
}

export function useGetLearnerAssessments(learnerId) {
  return useQuery({
    queryKey: ['assessments', 'learner', learnerId],
    queryFn: async () => {
      const res = await assessmentsAPI.getByLearner(learnerId);
      return res.data;
    },
    enabled: !!learnerId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => assessmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create assessment');
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => assessmentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update assessment');
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => assessmentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete assessment');
    },
  });
}
