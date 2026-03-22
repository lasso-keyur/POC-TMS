import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveyApi } from '../api/surveys'

const SURVEYS_KEY = ['surveys'] as const

export function useSurveys(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...SURVEYS_KEY, params],
    queryFn: () => surveyApi.list(params),
  })
}

export function useSurvey(id: number) {
  return useQuery({
    queryKey: [...SURVEYS_KEY, id],
    queryFn: () => surveyApi.get(id),
    enabled: !!id,
  })
}

export function useCreateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => surveyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SURVEYS_KEY })
    },
  })
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      surveyApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...SURVEYS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: SURVEYS_KEY })
    },
  })
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => surveyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SURVEYS_KEY })
    },
  })
}
