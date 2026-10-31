from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import Space, Department, Organization, SpaceMember, User
from backend.app.schemas.spaces import SpaceCreate

class SpaceService:
    @staticmethod
    def list_spaces(db: Session, organization_id: str, department_id: Optional[str] = None) -> List[Space]:
        query = db.query(Space).filter(Space.organization_id == organization_id)
        if department_id:
            query = query.filter(Space.department_id == department_id)
        return query.order_by(Space.name).all()

    @staticmethod
    def get_space(db: Session, space_id: str) -> Optional[Space]:
        return db.query(Space).filter(Space.id == space_id).first()

    @staticmethod
    def create_space(db: Session, organization_id: str, payload: SpaceCreate) -> Space:
        slug = payload.name.lower().replace(" ", "-").replace("/", "-")
        space = Space(
            organization_id=organization_id,
            department_id=payload.department_id,
            parent_space_id=payload.parent_space_id,
            name=payload.name,
            slug=slug,
            space_type=payload.space_type,
            description=payload.description,
            sensitivity_level=payload.sensitivity_level
        )
        db.add(space)
        db.commit()
        db.refresh(space)
        return space

    @staticmethod
    def get_space_metrics(db: Session, space: Space) -> dict:
        from backend.app.models.entities import Decision, Task, Blocker, SpaceMember
        decision_count = db.query(Decision).filter(Decision.space_id == space.id).count()
        task_count = db.query(Task).filter(Task.space_id == space.id).count()
        blocker_count = db.query(Blocker).filter(Blocker.space_id == space.id, Blocker.status == "active").count()
        member_count = db.query(SpaceMember).filter(SpaceMember.space_id == space.id).count()
        return {
            "decision_count": decision_count,
            "task_count": task_count,
            "blocker_count": blocker_count,
            "member_count": member_count,
        }
