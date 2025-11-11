from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

try:
    from app.entity.permission import PermissionCreate, PermissionUpdate, PermissionInDB
except ModuleNotFoundError:  # pragma: no cover
    from entity.permission import PermissionCreate, PermissionUpdate, PermissionInDB  # type: ignore

COLLECTION = "permissions"


async def create_permission(db: AsyncIOMotorDatabase, data: PermissionCreate) -> PermissionInDB:
    doc = data.dict()
    result = await db[COLLECTION].insert_one(doc)
    created = await db[COLLECTION].find_one({"_id": result.inserted_id})
    return PermissionInDB(**created)


async def get_permission(db: AsyncIOMotorDatabase, permission_id: str) -> Optional[PermissionInDB]:
    if not ObjectId.is_valid(permission_id):
        return None
    doc = await db[COLLECTION].find_one({"_id": ObjectId(permission_id)})
    return PermissionInDB(**doc) if doc else None


async def list_permissions(db: AsyncIOMotorDatabase) -> List[PermissionInDB]:
    cursor = db[COLLECTION].find()
    return [PermissionInDB(**doc) async for doc in cursor]


async def update_permission(
    db: AsyncIOMotorDatabase, permission_id: str, data: PermissionUpdate
) -> Optional[PermissionInDB]:
    if not ObjectId.is_valid(permission_id):
        return None

    update_data = {k: v for k, v in data.dict(exclude_unset=True).items()}
    if not update_data:
        doc = await db[COLLECTION].find_one({"_id": ObjectId(permission_id)})
        return PermissionInDB(**doc) if doc else None

    doc = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(permission_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    return PermissionInDB(**doc) if doc else None


async def delete_permission(db: AsyncIOMotorDatabase, permission_id: str) -> bool:
    if not ObjectId.is_valid(permission_id):
        return False
    oid = ObjectId(permission_id)
    res = await db[COLLECTION].delete_one({"_id": oid})
    if res.deleted_count == 1:
        # remove dangling references from roles
        await db["roles"].update_many({}, {"$pull": {"permission_ids": oid}})
        return True
    return False


async def get_permissions_by_names(
    db: AsyncIOMotorDatabase,
    names: List[str],
) -> List[PermissionInDB]:
    if not names:
        return []
    cursor = db[COLLECTION].find({"name": {"$in": names}})
    return [PermissionInDB(**doc) async for doc in cursor]


async def get_permissions_by_ids(
    db: AsyncIOMotorDatabase,
    ids: List[ObjectId],
) -> List[PermissionInDB]:
    if not ids:
        return []
    cursor = db[COLLECTION].find({"_id": {"$in": ids}})
    return [PermissionInDB(**doc) async for doc in cursor]
