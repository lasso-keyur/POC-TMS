import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { programApi } from '../api/programs'

const PROGRAMS_KEY = ['programs'] as const

export function usePrograms(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...PROGRAMS_KEY, params],
    queryFn: () => programApi.list(params),
  })
}

export function useProgram(id: number) {
  return useQuery({
    queryKey: [...PROGRAMS_KEY, id],
    queryFn: () => programApi.get(id),
    enabled: !!id,
  })
}

export function useCreateProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => programApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY })
    },
  })
}

export function useUpdateProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      programApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PROGRAMS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY })
    },
  })
}

export function useDeleteProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => programApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY })
    },
  })
}
