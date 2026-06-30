import { supabase, isSimulatedMode } from "@/lib/supabase"
import { Project, CanvasData } from "@/types/project"

const SIMULATED_PROJECTS_KEY = "snapstore_simulated_projects"

// Helper to get simulated projects
const getSimulatedProjects = (): Project[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(SIMULATED_PROJECTS_KEY)
  return data ? JSON.parse(data) : []
}

// Helper to save simulated projects
const saveSimulatedProjects = (projects: Project[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(SIMULATED_PROJECTS_KEY, JSON.stringify(projects))
}

const defaultCanvasData: CanvasData = {
  width: 1242,
  height: 2688,
  layers: [],
  background: {
    type: "gradient",
    gradient: "linear-gradient(to bottom right, #a855f7, #6366f1)", // Sleek purple to indigo gradient
  },
}

export const ProjectRepository = {
  getProjects: async (userId: string): Promise<Project[]> => {
    if (isSimulatedMode || !supabase) {
      return getSimulatedProjects().filter((p) => p.user_id === userId)
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) {
        // Handle case where table projects does not exist yet (code 42P01)
        if (
          error.code === "42P01" ||
          error.message?.includes('relation "projects" does not exist')
        ) {
          console.warn(
            "Supabase 'projects' table not found. Falling back to local storage simulation."
          )
          return getSimulatedProjects().filter((p) => p.user_id === userId)
        }
        throw error
      }
      return (data || []) as Project[]
    } catch (err) {
      console.warn("Error loading projects from Supabase, falling back to local storage:", err)
      return getSimulatedProjects().filter((p) => p.user_id === userId)
    }
  },

  createProject: async (
    userId: string,
    name: string,
    canvasData?: CanvasData
  ): Promise<Project> => {
    const newProject: Project = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      name: name,
      canvas_data: canvasData || defaultCanvasData,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSimulatedMode || !supabase) {
      const projects = getSimulatedProjects()
      projects.unshift(newProject)
      saveSimulatedProjects(projects)
      return newProject
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: newProject.name,
          canvas_data: newProject.canvas_data,
          is_archived: false,
        })
        .select()
        .single()

      if (error) {
        if (error.code === "42P01") {
          const projects = getSimulatedProjects()
          projects.unshift(newProject)
          saveSimulatedProjects(projects)
          return newProject
        }
        throw error
      }
      return data as Project
    } catch (err) {
      console.warn("Failed to write to Supabase database, saving locally:", err)
      const projects = getSimulatedProjects()
      projects.unshift(newProject)
      saveSimulatedProjects(projects)
      return newProject
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    const updatedAt = new Date().toISOString()
    const mergedUpdates = { ...updates, updated_at: updatedAt }

    if (isSimulatedMode || !supabase || projectId.startsWith("proj_")) {
      const projects = getSimulatedProjects()
      const index = projects.findIndex((p) => p.id === projectId)
      if (index === -1) throw new Error("Project not found.")

      const updatedProject = { ...projects[index], ...mergedUpdates }
      projects[index] = updatedProject
      saveSimulatedProjects(projects)
      return updatedProject
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          name: updates.name,
          canvas_data: updates.canvas_data,
          is_archived: updates.is_archived,
          thumbnail_url: updates.thumbnail_url,
          updated_at: updatedAt,
        })
        .eq("id", projectId)
        .select()
        .single()

      if (error) throw error
      return data as Project
    } catch (err) {
      console.warn("Failed to update project in Supabase, saving locally:", err)
      const projects = getSimulatedProjects()
      const index = projects.findIndex((p) => p.id === projectId)
      if (index !== -1) {
        const updatedProject = { ...projects[index], ...mergedUpdates }
        projects[index] = updatedProject
        saveSimulatedProjects(projects)
        return updatedProject
      }
      throw err
    }
  },

  deleteProject: async (projectId: string): Promise<void> => {
    if (isSimulatedMode || !supabase || projectId.startsWith("proj_")) {
      const projects = getSimulatedProjects()
      const filtered = projects.filter((p) => p.id !== projectId)
      saveSimulatedProjects(filtered)
      return
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)
      if (error) throw error
    } catch (err) {
      console.warn("Failed to delete project in Supabase, removing locally:", err)
      const projects = getSimulatedProjects()
      const filtered = projects.filter((p) => p.id !== projectId)
      saveSimulatedProjects(filtered)
    }
  },

  duplicateProject: async (projectId: string): Promise<Project> => {
    let sourceProject: Project | null = null

    if (isSimulatedMode || !supabase || projectId.startsWith("proj_")) {
      const projects = getSimulatedProjects()
      sourceProject = projects.find((p) => p.id === projectId) || null
    } else {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single()
        if (error) throw error
        sourceProject = data as Project
      } catch (err) {
        console.warn("Failed to load project for duplication, reading locally:", err)
        const projects = getSimulatedProjects()
        sourceProject = projects.find((p) => p.id === projectId) || null
      }
    }

    if (!sourceProject) throw new Error("Source project not found.")

    const duplicatedProject: Project = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      user_id: sourceProject.user_id,
      name: sourceProject.name + " (Copy)",
      canvas_data: JSON.parse(JSON.stringify(sourceProject.canvas_data)), // deep clone
      thumbnail_url: sourceProject.thumbnail_url,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSimulatedMode || !supabase || projectId.startsWith("proj_")) {
      const projects = getSimulatedProjects()
      projects.unshift(duplicatedProject)
      saveSimulatedProjects(projects)
      return duplicatedProject
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: duplicatedProject.user_id,
          name: duplicatedProject.name,
          canvas_data: duplicatedProject.canvas_data,
          thumbnail_url: duplicatedProject.thumbnail_url,
          is_archived: false,
        })
        .select()
        .single()

      if (error) throw error
      return data as Project
    } catch (err) {
      console.warn("Failed to insert duplicated project in Supabase, saving locally:", err)
      const projects = getSimulatedProjects()
      projects.unshift(duplicatedProject)
      saveSimulatedProjects(projects)
      return duplicatedProject
    }
  },
}
