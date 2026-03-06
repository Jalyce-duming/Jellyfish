import { get, post, put, del } from './http'
import type {
  Project,
  Chapter,
  Shot,
  ShotDetail,
  Asset,
  PromptTemplate,
  FileItem,
  TimelineClip,
  Agent,
  Provider,
  Model,
  ModelSettings,
} from '../mocks/data'

const api = {
  projects: {
    list: () => get<Project[]>('/projects'),
    get: (id: string) => get<Project>(`/projects/${id}`),
    create: (data: Partial<Project> & { name: string }) => post<Project>('/projects', data),
    update: (id: string, data: Partial<Project>) => put<Project>(`/projects/${id}`, data),
    delete: (id: string) => del<void>(`/projects/${id}`),
  },
  chapters: {
    list: (projectId: string) => get<Chapter[]>(`/projects/${projectId}/chapters`),
  },
  shots: {
    list: (chapterId: string) => get<Shot[]>(`/chapters/${chapterId}/shots`),
    get: (shotId: string) => get<ShotDetail>(`/shots/${shotId}`),
  },
  assets: {
    list: (type?: string) =>
      get<Asset[]>(type ? `/assets?type=${type}` : '/assets'),
  },
  prompts: {
    templates: () => get<PromptTemplate[]>('/prompts/templates'),
  },
  files: {
    list: () => get<FileItem[]>('/files'),
  },
  timeline: {
    get: (projectId: string) =>
      get<TimelineClip[]>(`/projects/${projectId}/timeline`),
  },
  agents: {
    list: () => get<Agent[]>('/agents'),
    get: (id: string) => get<Agent>(`/agents/${id}`),
    create: (data: Partial<Agent> & { name: string; type: Agent['type'] }) =>
      post<Agent>('/agents', data),
    update: (id: string, data: Partial<Agent>) => put<Agent>(`/agents/${id}`, data),
    delete: (id: string) => del<void>(`/agents/${id}`),
  },
  models: {
    providers: {
      list: () => get<Provider[]>('/models/providers'),
      get: (id: string) => get<Provider>(`/models/providers/${id}`),
      create: (data: Partial<Provider> & { name: string; baseUrl: string }) =>
        post<Provider>('/models/providers', data),
      update: (id: string, data: Partial<Provider>) => put<Provider>(`/models/providers/${id}`, data),
      delete: (id: string) => del<void>(`/models/providers/${id}`),
    },
    list: () => get<Model[]>('/models/list'),
    get: (id: string) => get<Model>(`/models/list/${id}`),
    create: (data: Partial<Model> & { name: string; category: Model['category']; providerId: string }) =>
      post<Model>('/models/list', data),
    update: (id: string, data: Partial<Model>) => put<Model>(`/models/list/${id}`, data),
    delete: (id: string) => del<void>(`/models/list/${id}`),
    settings: {
      get: () => get<ModelSettings>('/models/settings'),
      update: (data: Partial<ModelSettings>) => put<ModelSettings>('/models/settings', data),
    },
  },
}

export default api
