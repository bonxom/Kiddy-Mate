from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.bootstrap.dependency_registry import register_dependencies
from app.bootstrap.router_registry import register_routers
from app.bootstrap.scheduler_registry import shutdown_scheduler, startup_scheduler
from app.db.database import init_database


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await init_database()
    await startup_scheduler()
    try:
        yield
    finally:
        await shutdown_scheduler()


def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://kiddymate.com",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_dependencies(app)
    register_routers(app)

    @app.get("/")
    def read_root() -> dict[str, str]:
        return {"message": "Welcome to KiddyMate API!"}

    return app
