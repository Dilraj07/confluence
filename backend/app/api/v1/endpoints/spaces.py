from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.services.space_service import SpaceService
from backend.app.schemas.spaces import SpaceOut, SpaceCreate, DepartmentOut
from backend.app.models.entities import Space, Department, Organization

router = APIRouter()

@router.get("", response_model=List[SpaceOut])
def list_spaces(
    department_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Default to first organization for MVP
    org = db.query(Organization).first()
    if not org:
        return []
    spaces = SpaceService.list_spaces(db, org.id, department_id)
    results = []
    for s in spaces:
        metrics = SpaceService.get_space_metrics(db, s)
        results.append(SpaceOut(
            id=s.id,
            organization_id=s.organization_id,
            department_id=s.department_id,
            parent_space_id=s.parent_space_id,
            name=s.name,
            slug=s.slug,
            space_type=s.space_type,
            description=s.description,
            sensitivity_level=s.sensitivity_level,
            created_at=s.created_at,
            **metrics
        ))
    return results

@router.get("/{space_id}", response_model=SpaceOut)
def get_space(space_id: str, db: Session = Depends(get_db)):
    s = SpaceService.get_space(db, space_id)
    if not s:
        raise HTTPException(status_code=404, detail="Space not found")
    metrics = SpaceService.get_space_metrics(db, s)
    return SpaceOut(
        id=s.id,
        organization_id=s.organization_id,
        department_id=s.department_id,
        parent_space_id=s.parent_space_id,
        name=s.name,
        slug=s.slug,
        space_type=s.space_type,
        description=s.description,
        sensitivity_level=s.sensitivity_level,
        created_at=s.created_at,
        **metrics
    )

@router.post("", response_model=SpaceOut)
def create_space(payload: SpaceCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized. Run /api/v1/seed first.")
    s = SpaceService.create_space(db, org.id, payload)
    return SpaceOut(
        id=s.id,
        organization_id=s.organization_id,
        department_id=s.department_id,
        parent_space_id=s.parent_space_id,
        name=s.name,
        slug=s.slug,
        space_type=s.space_type,
        description=s.description,
        sensitivity_level=s.sensitivity_level,
        created_at=s.created_at
    )

