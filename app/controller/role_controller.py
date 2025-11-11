# app/controller/role_controller.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

try:
    from app.config.database import get_database
    from app.entity.role import RoleCreate, RoleUpdate, RoleInDB
    from app.service.role_service import (
        create_role,
        get_role,
        list_roles,
        update_role,
        delete_role,
        add_permission_to_role,
        remove_permission_from_role,
    )
except ModuleNotFoundError:  # pragma: no cover
    from config.database import get_database  # type: ignore
    from entity.role import RoleCreate, RoleUpdate, RoleInDB  # type: ignore
    from service.role_service import (  # type: ignore
        create_role,
        get_role,
        list_roles,
        update_role,
        delete_role,
        add_permission_to_role,
        remove_permission_from_role,
    )

router = APIRouter(prefix="/roles", tags=["Roles"])


def get_db() -> AsyncIOMotorDatabase:
    return get_database()


@router.post("", response_model=RoleInDB, status_code=status.HTTP_201_CREATED)
async def create_role_api(
    payload: RoleCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    existing = await db["roles"].find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    try:
        return await create_role(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("", response_model=List[RoleInDB])
async def list_roles_api(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await list_roles(db)


@router.get("/{role_id}", response_model=RoleInDB)
async def get_role_api(
    role_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    role = await get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/{role_id}", response_model=RoleInDB)
async def update_role_api(
    role_id: str,
    payload: RoleUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        role = await update_role(db, role_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role_api(
    role_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    ok = await delete_role(db, role_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Role not found")
    return None


@router.post("/{role_id}/permissions/{permission_id}", response_model=RoleInDB)
async def add_permission_to_role_api(
    role_id: str,
    permission_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    role = await add_permission_to_role(db, role_id, permission_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role or Permission not found")
    return role


@router.delete("/{role_id}/permissions/{permission_id}", response_model=RoleInDB)
async def remove_permission_from_role_api(
    role_id: str,
    permission_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    role = await remove_permission_from_role(db, role_id, permission_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role or Permission not found")
    return role
