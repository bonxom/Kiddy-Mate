from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

try:
    from app.config.database import get_database
    from app.entity.permission import PermissionCreate, PermissionUpdate, PermissionInDB
    from app.service.permission_service import (
        create_permission,
        get_permission,
        list_permissions,
        update_permission,
        delete_permission,
    )
except ModuleNotFoundError:  # pragma: no cover - depends on import path
    from config.database import get_database  # type: ignore
    from entity.permission import PermissionCreate, PermissionUpdate, PermissionInDB  # type: ignore
    from service.permission_service import (  # type: ignore
        create_permission,
        get_permission,
        list_permissions,
        update_permission,
        delete_permission,
    )

router = APIRouter(prefix="/permissions", tags=["Permissions"])


def get_db() -> AsyncIOMotorDatabase:
    return get_database()


@router.post("", response_model=PermissionInDB, status_code=status.HTTP_201_CREATED)
async def create_permission_api(
    payload: PermissionCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    existing = await db["permissions"].find_one({"name": payload.name})
    if existing:
        raise HTTPException(status_code=400, detail="Permission name already exists")
    return await create_permission(db, payload)


@router.get("", response_model=List[PermissionInDB])
async def list_permissions_api(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    return await list_permissions(db)


@router.get("/{permission_id}", response_model=PermissionInDB)
async def get_permission_api(
    permission_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    perm = await get_permission(db, permission_id)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm


@router.put("/{permission_id}", response_model=PermissionInDB)
async def update_permission_api(
    permission_id: str,
    payload: PermissionUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    perm = await update_permission(db, permission_id, payload)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm


@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission_api(
    permission_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    ok = await delete_permission(db, permission_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Permission not found")
    return None
