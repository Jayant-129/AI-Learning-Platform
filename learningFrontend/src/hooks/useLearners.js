import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learnersAPI } from '../utils/api';
import { toast } from 'react-toastify';

export function useGetLearners() {
  return useQuery({
    queryKey: ['learners'],
    queryFn: async () => {
      const res = await learnersAPI.getAll();
      return res.data;
    },
  });
}

export function useGetLearner(id) {
  return useQuery({
    queryKey: ['learner', id],
    queryFn: async () => {
      const res = await learnersAPI.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => learnersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learners'] });
      toast.success('Learner created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create learner');
    },
  });
}

export function useUpdateLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => learnersAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learners'] });
      queryClient.invalidateQueries({ queryKey: ['learner', variables.id] });
      toast.success('Learner updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update learner');
    },
  });
}

export function useDeleteLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => learnersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learners'] });
      toast.success('Learner deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete learner');
    },
  });
}

export function useUploadCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => learnersAPI.uploadCsv(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['learners'] });
      toast.success(`${res.data.length} learners imported from CSV!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'CSV upload failed');
    },
  });
}
