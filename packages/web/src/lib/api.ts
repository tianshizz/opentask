import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Ticket {
  id: string
  title: string
  description: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'WAITING_REVIEW' | 'NEEDS_REVISION' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags: string[]
  assignedAgent: any
  createdBy: any
  channelId?: string | null
  channelType?: 'WEB_UI' | 'SLACK' | 'DISCORD' | 'TELEGRAM' | 'EMAIL' | 'WEBHOOK' | 'API' | null
  createdAt: string
  updatedAt: string
  _count?: {
    attempts: number
    comments: number
  }
}

export interface Attempt {
  id: string
  attemptNumber: number
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'ABORTED'
  reasoning: string | null
  outcome: string | null
  startedAt: string
  completedAt: string | null
  agent: any
  steps?: any[]
  artifacts?: any[]
}

export interface Comment {
  id: string
  content: string
  commentType: string
  createdAt: string
  author: any
}

export const ticketsApi = {
  list: (params?: { status?: string; priority?: string; page?: number; limit?: number }) =>
    api.get<{ data: Ticket[]; pagination: any }>('/tickets', { params }),
  
  get: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`),
  
  create: (data: { title: string; description?: string; priority?: string; tags?: string[] }) =>
    api.post<Ticket>('/tickets', data),
  
  updateStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/tickets/${id}/status`, { status, reason }),
  
  approve: (id: string, message?: string) =>
    api.post(`/tickets/${id}/approve`, { message }),
  
  requestRevision: (id: string, message: string) =>
    api.post(`/tickets/${id}/request-revision`, { message }),
}

export const attemptsApi = {
  getByTicket: (ticketId: string) =>
    api.get<Attempt[]>(`/attempts/ticket/${ticketId}`),
}

export const commentsApi = {
  getByTicket: (ticketId: string) =>
    api.get<Comment[]>(`/comments/ticket/${ticketId}`),
  
  create: (data: { ticketId: string; content: string; authorId: string }) =>
    api.post<Comment>('/comments', data),
}

export default api
