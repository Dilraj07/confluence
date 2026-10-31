from fastapi import APIRouter
from scripts.seed_demo import run_seed

router = APIRouter()

@router.post("")
def trigger_seed():
    run_seed()
    return {"status": "success", "message": "Demo data successfully seeded"}

