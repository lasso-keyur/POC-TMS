import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { participantApi } from '../api/participants'

const PARTICIPANTS_KEY = ['participants'] as const

export function useParticipants(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...PARTICIPANTS_KEY, params],
    queryFn: () => participantApi.list(params),
  })
}

export function useParticipant(id: number) {
  return useQuery({
    queryKey: [...PARTICIPANTS_KEY, id],
    queryFn: () => participantApi.get(id),
    enabled: !!id,
  })
}

export function useCreateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => participantApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY })
    },
  })
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      participantApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...PARTICIPANTS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY })
    },
  })
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => participantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY })
    },
  })
}
