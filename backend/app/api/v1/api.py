from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    spaces,
    meetings,
    decisions,
    tasks,
    blockers,
    graph,
    query,
    seed
)

api_router = APIRouter()
api_router.include_router(spaces.router, prefix="/spaces", tags=["Spaces"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["Decisions"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(blockers.router, prefix="/blockers", tags=["Blockers"])
api_router.include_router(graph.router, prefix="/graph", tags=["Graph & Metrics"])
api_router.include_router(query.router, prefix="/query", tags=["Query & Intelligence"])
api_router.include_router(seed.router, prefix="/seed", tags=["Seed Demo Data"])

