import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InventoryNode, ProcessBox, VSMProject } from '@/types/vsm'
import { buildVersionFromSteps, defaultMetadata } from '@/lib/templates'

interface VSMStore {
  projects: VSMProject[]
  activeProjectId: string | null

  createProjectFromSteps: (name: string, sectorId: string, steps: string[]) => string
  createBlankProject: (name: string, sectorId: string) => string
  deleteProject: (id: string) => void
  selectProject: (id: string | null) => void

  updateProcessBox: (projectId: string, boxId: string, patch: Partial<ProcessBox>) => void
  updateInventoryNode: (projectId: string, nodeId: string, patch: Partial<InventoryNode>) => void
  updateMetadata: (projectId: string, patch: Partial<VSMProject['versions'][number]['metadata']>) => void
  addProcessBox: (projectId: string, name: string, sectorId: string) => void
  removeProcessBox: (projectId: string, boxId: string) => void
  updateNodePosition: (projectId: string, nodeId: string, position: { x: number; y: number }) => void
}

function touch(project: VSMProject): VSMProject {
  return { ...project, updatedAt: new Date().toISOString() }
}

function activeVersion(project: VSMProject) {
  return project.versions[0]
}

export const useVSMStore = create<VSMStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProjectFromSteps: (name, sectorId, steps) => {
        const id = `proj_${Math.random().toString(36).slice(2, 10)}`
        const built = buildVersionFromSteps(steps, sectorId)
        const project: VSMProject = {
          id,
          name,
          sectorId,
          isMultiSector: false,
          versions: [
            {
              id: `ver_${Math.random().toString(36).slice(2, 10)}`,
              kind: 'atual',
              ...built,
              metadata: defaultMetadata(),
            },
          ],
          comments: [],
          history: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ projects: [...state.projects, project], activeProjectId: id }))
        return id
      },

      createBlankProject: (name, sectorId) => get().createProjectFromSteps(name, sectorId, []),

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }))
      },

      selectProject: (id) => set({ activeProjectId: id }),

      updateProcessBox: (projectId, boxId, patch) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            const processBoxes = version.processBoxes.map((b) => (b.id === boxId ? { ...b, ...patch } : b))
            return touch({ ...p, versions: [{ ...version, processBoxes }, ...p.versions.slice(1)] })
          }),
        }))
      },

      updateInventoryNode: (projectId, nodeId, patch) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            const inventoryNodes = version.inventoryNodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n))
            return touch({ ...p, versions: [{ ...version, inventoryNodes }, ...p.versions.slice(1)] })
          }),
        }))
      },

      updateMetadata: (projectId, patch) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            return touch({
              ...p,
              versions: [{ ...version, metadata: { ...version.metadata, ...patch } }, ...p.versions.slice(1)],
            })
          }),
        }))
      },

      addProcessBox: (projectId, name, sectorId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            const maxX = version.processBoxes.reduce((m, b) => Math.max(m, b.position.x), -260)
            const newBox: ProcessBox = {
              id: `proc_${Math.random().toString(36).slice(2, 10)}`,
              name,
              sectorId,
              cycleTime: 0,
              setupTime: 0,
              uptime: 0.9,
              operators: 1,
              position: { x: maxX + 260, y: 120 },
            }
            return touch({
              ...p,
              versions: [{ ...version, processBoxes: [...version.processBoxes, newBox] }, ...p.versions.slice(1)],
            })
          }),
        }))
      },

      removeProcessBox: (projectId, boxId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            const processBoxes = version.processBoxes.filter((b) => b.id !== boxId)
            const connections = version.connections.filter((c) => c.fromId !== boxId && c.toId !== boxId)
            return touch({ ...p, versions: [{ ...version, processBoxes, connections }, ...p.versions.slice(1)] })
          }),
        }))
      },

      updateNodePosition: (projectId, nodeId, position) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const version = activeVersion(p)
            const processBoxes = version.processBoxes.map((b) => (b.id === nodeId ? { ...b, position } : b))
            const inventoryNodes = version.inventoryNodes.map((n) => (n.id === nodeId ? { ...n, position } : n))
            return touch({ ...p, versions: [{ ...version, processBoxes, inventoryNodes }, ...p.versions.slice(1)] })
          }),
        }))
      },
    }),
    { name: 'vsm-hospitalar-projects' },
  ),
)
