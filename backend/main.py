from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, children, tasks, task_library, rewards, games, interact, reports, dashboard, assessments, onboarding, generate
from app.db.database import init_database
from app.scheduler import scheduler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://kiddymate.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(onboarding.router, tags=["Onboarding"])
app.include_router(children.router, prefix="/children", tags=["Children"])

app.include_router(task_library.router, tags=["Task Library"])

app.include_router(tasks.router, prefix="/children", tags=["Child Tasks"])

app.include_router(rewards.shop_router, prefix="/shop", tags=["Reward Shop"])

app.include_router(rewards.router, prefix="/children", tags=["Rewards"])
app.include_router(games.router, prefix="/children", tags=["Games"])
app.include_router(interact.router, prefix="/children", tags=["Interactions"])
app.include_router(assessments.router, prefix="/children", tags=["Assessments"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(generate.router, tags=["LLM Generation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to KiddyMate API!"}

@app.on_event("startup")
async def startup_event():
    await init_database()
    if not scheduler.running:
        scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()