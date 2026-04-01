from dataclasses import dataclass
from typing import Sequence

from fastapi import APIRouter, FastAPI

from app.modules.child.api.games_controller import router as child_games_router
from app.modules.child.api.interactions_controller import router as child_interactions_router
from app.modules.child.api.me_controller import router as child_me_router
from app.modules.child.api.rewards_controller import router as child_rewards_router
from app.modules.child.api.tasks_controller import router as child_tasks_router
from app.modules.identity.api.child_auth_controller import router as child_auth_router
from app.modules.identity.api.parent_auth_controller import router as parent_auth_router
from app.modules.parent.api.ai_controller import router as parent_ai_router
from app.modules.parent.api.assessments_controller import router as parent_assessments_router
from app.modules.parent.api.child_rewards_controller import router as parent_child_rewards_router
from app.modules.parent.api.child_tasks_controller import router as parent_child_tasks_router
from app.modules.parent.api.children_controller import router as parent_children_router
from app.modules.parent.api.dashboard_controller import router as parent_dashboard_router
from app.modules.parent.api.games_controller import router as parent_games_router
from app.modules.parent.api.interactions_controller import router as parent_interactions_router
from app.modules.parent.api.onboarding_controller import router as parent_onboarding_router
from app.modules.parent.api.reports_controller import router as parent_reports_router
from app.modules.parent.api.shop_controller import router as parent_shop_router
from app.modules.parent.api.task_library_controller import router as parent_task_library_router


@dataclass(frozen=True)
class RouterMount:
    router: APIRouter
    prefix: str = ""
    tags: Sequence[str] = ()
    include_in_schema: bool = True


ROUTE_MOUNTS: tuple[RouterMount, ...] = (
    RouterMount(parent_auth_router, prefix="/parent/auth", tags=("Parent Auth",)),
    RouterMount(parent_onboarding_router, prefix="/parent", tags=("Parent Onboarding",)),
    RouterMount(parent_children_router, prefix="/parent/children", tags=("Parent Children",)),
    RouterMount(parent_assessments_router, prefix="/parent/children", tags=("Parent Assessments",)),
    RouterMount(parent_child_tasks_router, prefix="/parent/children", tags=("Parent Child Tasks",)),
    RouterMount(parent_interactions_router, prefix="/parent/children", tags=("Parent Child Interactions",)),
    RouterMount(parent_games_router, prefix="/parent/children", tags=("Parent Child Games",)),
    RouterMount(parent_child_rewards_router, prefix="/parent/children", tags=("Parent Child Rewards",)),
    RouterMount(parent_task_library_router, prefix="/parent", tags=("Parent Task Library",)),
    RouterMount(parent_shop_router, prefix="/parent/shop", tags=("Parent Reward Shop",)),
    RouterMount(parent_reports_router, prefix="/parent/reports", tags=("Parent Reports",)),
    RouterMount(parent_dashboard_router, prefix="/parent/dashboard", tags=("Parent Dashboard",)),
    RouterMount(parent_ai_router, prefix="/parent", tags=("Parent AI Generation",)),
    RouterMount(child_auth_router, prefix="/child/auth", tags=("Child Auth",)),
    RouterMount(child_me_router, prefix="/child", tags=("Child Profile",)),
    RouterMount(child_tasks_router, prefix="/child", tags=("Child Tasks",)),
    RouterMount(child_rewards_router, prefix="/child", tags=("Child Rewards",)),
    RouterMount(child_interactions_router, prefix="/child", tags=("Child Interactions",)),
    RouterMount(child_games_router, prefix="/child", tags=("Child Games",)),
)


def register_routers(app: FastAPI) -> None:
    for mount in ROUTE_MOUNTS:
        app.include_router(
            mount.router,
            prefix=mount.prefix,
            tags=list(mount.tags),
            include_in_schema=mount.include_in_schema,
        )
