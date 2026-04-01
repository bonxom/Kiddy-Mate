from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.bootstrap.dependency_registry import register_dependencies
from app.bootstrap.router_registry import register_routers
from app.bootstrap.scheduler_registry import shutdown_scheduler, startup_scheduler
from app.db.database import init_database
from app.modules.child.domain.errors import ChildApplicationError


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

    @app.exception_handler(ChildApplicationError)
    async def handle_child_application_error(
        _: Request,
        exc: ChildApplicationError,
    ) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.get("/")
    def read_root() -> dict[str, str]:
        return {"message": "Welcome to KiddyMate API!"}

    return app
