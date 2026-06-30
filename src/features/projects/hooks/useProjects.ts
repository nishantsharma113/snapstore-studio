import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/authStore"
import { ProjectRepository } from "../data/project-repository"
import { Project, CanvasData } from "@/types/project"

export function useProjectsQuery() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ["projects", user?.uid],
    queryFn: () => ProjectRepository.getProjects(user!.uid),
    enabled: !!user?.uid,
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ name, canvasData }: { name: string; canvasData?: CanvasData }) =>
      ProjectRepository.createProject(user!.uid, name, canvasData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.uid] })
    },
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) =>
      ProjectRepository.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.uid] })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (projectId: string) => ProjectRepository.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.uid] })
    },
  })
}

export function useDuplicateProjectMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (projectId: string) => ProjectRepository.duplicateProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.uid] })
    },
  })
}
