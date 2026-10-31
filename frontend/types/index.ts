export interface Space {
  id: string;
  organization_id: string;
  department_id?: string;
  parent_space_id?: string;
  name: string;
  slug: string;
  space_type: string;
  description?: string;
  sensitivity_level: string;
  created_at: string;
  member_count: number;
  decision_count: number;
  task_count: number;
  blocker_count: number;
}

export interface Evidence {
  id: string;
  meeting_id: string;
  transcript_segment_id: string;
  quote: string;
  speaker_name?: string;
  start_offset?: number;
  end_offset?: number;
  confidence_score: number;
}

export interface DecisionVersion {
  id: string;
  version_number: number;
  statement: string;
  status: string;
  change_reason?: string;
  created_by?: string;
  created_at: string;
}

export interface Decision {
  id: string;
  organization_id: string;
  space_id: string;
  space_name?: string;
  meeting_id: string;
  meeting_title?: string;
  statement: string;
  rationale?: string;
  decision_type: string;
  status: 'proposed' | 'active' | 'superseded' | 'disputed' | 'completed' | 'cancelled' | 'rejected';
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  decided_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  evidence_items: Evidence[];
  versions: DecisionVersion[];
  superseded_by_id?: string;
  supersedes_id?: string;
}

export interface Task {
  id: string;
  organization_id: string;
  space_id: string;
  space_name?: string;
  meeting_id: string;
  meeting_title?: string;
  title: string;
  description?: string;
  assignee_name?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  evidence_quote?: string;
  transcript_segment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Blocker {
  id: string;
  organization_id: string;
  space_id: string;
  space_name?: string;
  meeting_id: string;
  meeting_title?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  reported_by?: string;
  evidence_quote?: string;
  transcript_segment_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  segment_index: number;
  speaker_name?: string;
  speaker_role?: string;
  start_ms?: number;
  end_ms?: number;
  content: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  organization_id: string;
  primary_space_id: string;
  primary_space_name?: string;
  project_id?: string;
  title: string;
  meeting_date: string;
  source_type: string;
  processing_status: string;
  created_at: string;
  segment_count: number;
  decision_count: number;
  task_count: number;
  blocker_count: number;
  raw_transcript_text?: string;
  segments?: TranscriptSegment[];
  spaces: { space_id: string; space_name: string; relationship_type: string }[];
}

export interface ExtractionCandidate {
  id: string;
  meeting_id: string;
  candidate_type: 'decision' | 'task' | 'blocker';
  payload: Record<string, any>;
  confidence_score: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes?: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  type: 'space' | 'meeting' | 'decision' | 'task' | 'blocker';
  label: string;
  subtext?: string;
  status?: string;
  space_id?: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  confidence?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface QueryEvidence {
  meeting_title: string;
  space_name: string;
  quote: string;
  speaker?: string;
  segment_id: string;
  timestamp?: string;
}

export interface AskQueryResponse {
  query: string;
  answer: string;
  confidence: number;
  memory_scope_used: string;
  sources: QueryEvidence[];
  impact_summary?: string;
  related_decision_ids: string[];
}

export interface MetricsSummary {
  active_decisions: number;
  superseded_decisions: number;
  open_tasks: number;
  active_blockers: number;
  pending_reviews: number;
  cross_space_risks: number;
}
