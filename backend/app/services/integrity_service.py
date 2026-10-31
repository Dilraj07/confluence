from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Space,
    Meeting,
    MeetingSpace,
    Decision,
    Task,
    Blocker,
    EntityRelationship,
    ExtractionCandidate
)
from backend.app.schemas.entities import GraphData, GraphNode, GraphEdge

class IntegrityService:
    @staticmethod
    def get_decision_network_graph(
        db: Session,
        organization_id: str,
        space_id: Optional[str] = None
    ) -> GraphData:
        """
        Builds graph of Spaces, Meetings, Decisions, Tasks, Blockers,
        and their relationships.
        """
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        node_ids = set()

        # 1. Fetch Spaces
        spaces_q = db.query(Space).filter(Space.organization_id == organization_id)
        if space_id:
            spaces_q = spaces_q.filter(Space.id == space_id)
        spaces = spaces_q.all()

        for s in spaces:
            nodes.append(GraphNode(
                id=s.id,
                type="space",
                label=s.name,
                subtext=s.space_type,
                status="active",
                space_id=s.id,
                metadata={"sensitivity": s.sensitivity_level}
            ))
            node_ids.add(s.id)

        # 2. Fetch Meetings
        meetings_q = db.query(Meeting).filter(Meeting.organization_id == organization_id)
        if space_id:
            meetings_q = meetings_q.join(MeetingSpace).filter(MeetingSpace.space_id == space_id)
        meetings = meetings_q.all()

        for m in meetings:
            nodes.append(GraphNode(
                id=m.id,
                type="meeting",
                label=m.title,
                subtext=m.meeting_date.strftime("%b %d, %Y") if m.meeting_date else None,
                status=m.processing_status,
                space_id=m.primary_space_id,
                metadata={"source_type": m.source_type}
            ))
            node_ids.add(m.id)

            # Edge from Meeting to Primary Space
            if m.primary_space_id in node_ids:
                edges.append(GraphEdge(
                    id=f"edge_m_s_{m.id}_{m.primary_space_id}",
                    source=m.id,
                    target=m.primary_space_id,
                    type="CONTAINED_IN",
                    label="Primary Space"
                ))

        # 3. Fetch Decisions
        decisions_q = db.query(Decision).filter(Decision.organization_id == organization_id)
        if space_id:
            decisions_q = decisions_q.filter(Decision.space_id == space_id)
        decisions = decisions_q.all()

        for d in decisions:
            nodes.append(GraphNode(
                id=d.id,
                type="decision",
                label=d.statement[:65] + ("..." if len(d.statement) > 65 else ""),
                subtext=f"{d.impact_level.upper()} impact • {d.status}",
                status=d.status,
                space_id=d.space_id,
                metadata={"rationale": d.rationale, "decided_by": d.decided_by}
            ))
            node_ids.add(d.id)

            # Edge to meeting
            if d.meeting_id in node_ids:
                edges.append(GraphEdge(
                    id=f"edge_d_m_{d.id}_{d.meeting_id}",
                    source=d.id,
                    target=d.meeting_id,
                    type="DECIDED_IN",
                    label="Decided In"
                ))

        # 4. Fetch Tasks
        tasks_q = db.query(Task).filter(Task.organization_id == organization_id)
        if space_id:
            tasks_q = tasks_q.filter(Task.space_id == space_id)
        tasks = tasks_q.all()

        for t in tasks:
            nodes.append(GraphNode(
                id=t.id,
                type="task",
                label=t.title,
                subtext=f"Assignee: {t.assignee_name or 'Unassigned'} • {t.status}",
                status=t.status,
                space_id=t.space_id,
                metadata={"priority": t.priority}
            ))
            node_ids.add(t.id)

            # Edge to meeting
            if t.meeting_id in node_ids:
                edges.append(GraphEdge(
                    id=f"edge_t_m_{t.id}_{t.meeting_id}",
                    source=t.id,
                    target=t.meeting_id,
                    type="ORIGINATED_IN",
                    label="Originated In"
                ))

        # 5. Fetch Blockers
        blockers_q = db.query(Blocker).filter(Blocker.organization_id == organization_id)
        if space_id:
            blockers_q = blockers_q.filter(Blocker.space_id == space_id)
        blockers = blockers_q.all()

        for b in blockers:
            nodes.append(GraphNode(
                id=b.id,
                type="blocker",
                label=b.description[:60] + ("..." if len(b.description) > 60 else ""),
                subtext=f"Severity: {b.severity} • {b.status}",
                status=b.status,
                space_id=b.space_id,
                metadata={"reported_by": b.reported_by}
            ))
            node_ids.add(b.id)

            # Edge to meeting
            if b.meeting_id in node_ids:
                edges.append(GraphEdge(
                    id=f"edge_b_m_{b.id}_{b.meeting_id}",
                    source=b.id,
                    target=b.meeting_id,
                    type="RAISED_IN",
                    label="Raised In"
                ))

        # 6. Fetch Entity Relationships (e.g. SUPERSEDES, DEPENDS_ON, BLOCKS)
        relationships = db.query(EntityRelationship).filter(
            EntityRelationship.organization_id == organization_id
        ).all()

        for r in relationships:
            # Check if both ends are present or allow linking
            if r.source_id in node_ids and r.target_id in node_ids:
                edges.append(GraphEdge(
                    id=r.id,
                    source=r.source_id,
                    target=r.target_id,
                    type=r.relationship_type,
                    label=r.relationship_type.replace("_", " "),
                    confidence=float(r.confidence_score) if r.confidence_score else 1.0
                ))

        return GraphData(nodes=nodes, edges=edges)

    @staticmethod
    def get_command_centre_summary(db: Session, organization_id: str, space_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates executive command center summary metrics."""
        decisions_q = db.query(Decision).filter(Decision.organization_id == organization_id)
        tasks_q = db.query(Task).filter(Task.organization_id == organization_id)
        blockers_q = db.query(Blocker).filter(Blocker.organization_id == organization_id)
        candidates_q = db.query(ExtractionCandidate).join(Meeting).filter(Meeting.organization_id == organization_id)

        if space_id:
            decisions_q = decisions_q.filter(Decision.space_id == space_id)
            tasks_q = tasks_q.filter(Task.space_id == space_id)
            blockers_q = blockers_q.filter(Blocker.space_id == space_id)
            candidates_q = candidates_q.filter(Meeting.primary_space_id == space_id)

        active_decisions = decisions_q.filter(Decision.status == "active").count()
        superseded_decisions = decisions_q.filter(Decision.status == "superseded").count()
        open_tasks = tasks_q.filter(Task.status.in_(["todo", "in_progress"])).count()
        active_blockers = blockers_q.filter(Blocker.status == "active").count()
        pending_reviews = candidates_q.filter(ExtractionCandidate.status == "pending").count()

        # Cross space risks: Count blockers that affect tasks or relationships of type BLOCKS / DEPENDS_ON
        cross_space_risks = db.query(EntityRelationship).filter(
            EntityRelationship.organization_id == organization_id,
            EntityRelationship.relationship_type.in_(["BLOCKS", "AFFECTS"])
        ).count()

        return {
            "active_decisions": active_decisions,
            "superseded_decisions": superseded_decisions,
            "open_tasks": open_tasks,
            "active_blockers": active_blockers,
            "pending_reviews": pending_reviews,
            "cross_space_risks": max(cross_space_risks, active_blockers)
        }
