import {
  Space,
  Meeting,
  Decision,
  Task,
  Blocker,
  ExtractionCandidate,
  GraphData,
  AskQueryResponse,
  MetricsSummary
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const body = await res.json();
      errorDetail = body.detail || body.message || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Spaces
  getSpaces: (departmentId?: string) =>
    fetchJson<Space[]>(`${API_BASE}/spaces${departmentId ? `?department_id=${departmentId}` : ''}`),
  
  getSpace: (spaceId: string) =>
    fetchJson<Space>(`${API_BASE}/spaces/${spaceId}`),

  createSpace: (payload: { name: string; department_id?: string; space_type?: string; description?: string }) =>
    fetchJson<Space>(`${API_BASE}/spaces`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Meetings
  getMeetings: (spaceId?: string) =>
    fetchJson<Meeting[]>(`${API_BASE}/meetings${spaceId ? `?space_id=${spaceId}` : ''}`),

  getMeeting: (meetingId: string) =>
    fetchJson<Meeting>(`${API_BASE}/meetings/${meetingId}`),

  createMeeting: (payload: {
    title: string;
    primary_space_id: string;
    linked_space_ids?: string[];
    transcript_text: string;
  }) =>
    fetchJson<Meeting>(`${API_BASE}/meetings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Candidates & Review
  getCandidates: (meetingId: string) =>
    fetchJson<ExtractionCandidate[]>(`${API_BASE}/meetings/${meetingId}/candidates`),

  reviewCandidate: (meetingId: string, candidateId: string, action: 'approve' | 'reject', editedPayload?: any) =>
    fetchJson<any>(`${API_BASE}/meetings/${meetingId}/candidates/${candidateId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, edited_payload: editedPayload }),
    }),

  // Decisions
  getDecisions: (spaceId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (spaceId) params.append('space_id', spaceId);
    if (status) params.append('status', status);
    return fetchJson<Decision[]>(`${API_BASE}/decisions?${params.toString()}`);
  },

  supersedeDecision: (newDecisionId: string, priorDecisionId: string, reason: string) =>
    fetchJson<any>(`${API_BASE}/decisions/${newDecisionId}/supersede`, {
      method: 'POST',
      body: JSON.stringify({ prior_decision_id: priorDecisionId, reason }),
    }),

  // Tasks & Blockers
  getTasks: (spaceId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (spaceId) params.append('space_id', spaceId);
    if (status) params.append('status', status);
    return fetchJson<Task[]>(`${API_BASE}/tasks?${params.toString()}`);
  },

  getBlockers: (spaceId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (spaceId) params.append('space_id', spaceId);
    if (status) params.append('status', status);
    return fetchJson<Blocker[]>(`${API_BASE}/blockers?${params.toString()}`);
  },

  // Graph & Metrics
  getGraph: (spaceId?: string) =>
    fetchJson<GraphData>(`${API_BASE}/graph${spaceId ? `?space_id=${spaceId}` : ''}`),

  getMetrics: (spaceId?: string) =>
    fetchJson<MetricsSummary>(`${API_BASE}/graph/metrics${spaceId ? `?space_id=${spaceId}` : ''}`),

  // Query & Organizational Intelligence
  askQuery: (query: string, spaceId?: string, scope: 'local' | 'shared' | 'organization' = 'organization') =>
    fetchJson<AskQueryResponse>(`${API_BASE}/query/ask`, {
      method: 'POST',
      body: JSON.stringify({ query, space_id: spaceId, scope }),
    }),

  executeAction: (actionType: string, payload: any) =>
    fetchJson<{ success: boolean; message: string; entity_id?: string; entity_type?: string }>(`${API_BASE}/query/execute-action`, {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, payload }),
    }),

  // Seed
  seedDemo: () =>
    fetchJson<{ status: string; message: string }>(`${API_BASE}/seed`, {
      method: 'POST',
    }),
};

