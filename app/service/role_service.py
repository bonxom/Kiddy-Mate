from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

try:
    from app.entity.role import RoleCreate, RoleUpdate, RoleInDB
    from app.service.permission_service import get_permissions_by_names
except ModuleNotFoundError:  # pragma: no cover
    from entity.role import RoleCreate, RoleUpdate, RoleInDB  # type: ignore
    from service.permission_service import get_permissions_by_names  # type: ignore

COLLECTION = "roles"


async def _permission_ids_from_names(
    db: AsyncIOMotorDatabase,
    names: List[str],
) -> List[ObjectId]:
    if not names:
        return []

    perms = await get_permissions_by_names(db, names)
    found_names = {permission.name for permission in perms}
    missing = [name for name in names if name not in found_names]
    if missing:
        raise ValueError(f"Permissions not found: {', '.join(missing)}")
    return [ObjectId(str(permission.id)) for permission in perms]


async def create_role(db: AsyncIOMotorDatabase, data: RoleCreate) -> RoleInDB:
    permission_ids = await _permission_ids_from_names(db, data.permission_names)

    doc = {
        "name": data.name,
        "description": data.description,
        "permission_ids": permission_ids,
    }

    result = await db[COLLECTION].insert_one(doc)
    created = await db[COLLECTION].find_one({"_id": result.inserted_id})
    return RoleInDB(**created)



async def get_role(db: AsyncIOMotorDatabase, role_id: str) -> Optional[RoleInDB]:
    if not ObjectId.is_valid(role_id):
        return None
    doc = await db[COLLECTION].find_one({"_id": ObjectId(role_id)})
    return RoleInDB(**doc) if doc else None


async def list_roles(db: AsyncIOMotorDatabase) -> List[RoleInDB]:
    cursor = db[COLLECTION].find()
    return [RoleInDB(**doc) async for doc in cursor]


async def update_role(db: AsyncIOMotorDatabase, role_id: str, data: RoleUpdate) -> Optional[RoleInDB]:
    if not ObjectId.is_valid(role_id):
        return None

    update_data = {}

    if data.name is not None:
        update_data["name"] = data.name

    if data.description is not None:
        update_data["description"] = data.description

    if data.permission_names is not None:
        permission_ids = await _permission_ids_from_names(db, data.permission_names)
        update_data["permission_ids"] = permission_ids

    if not update_data:
        doc = await db[COLLECTION].find_one({"_id": ObjectId(role_id)})
        return RoleInDB(**doc) if doc else None

    doc = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(role_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    return RoleInDB(**doc) if doc else None

async def delete_role(db: AsyncIOMotorDatabase, role_id: str) -> bool:
    if not ObjectId.is_valid(role_id):
        return False
    res = await db[COLLECTION].delete_one({"_id": ObjectId(role_id)})
    return res.deleted_count == 1


async def add_permission_to_role(
    db: AsyncIOMotorDatabase, role_id: str, permission_id: str
) -> Optional[RoleInDB]:
    if not (ObjectId.is_valid(role_id) and ObjectId.is_valid(permission_id)):
        return None

    role_oid = ObjectId(role_id)
    perm_oid = ObjectId(permission_id)

    role_exists = await db[COLLECTION].find_one({"_id": role_oid})
    if not role_exists:
        return None

    perm_exists = await db["permissions"].find_one({"_id": perm_oid})
    if not perm_exists:
        return None

    await db[COLLECTION].update_one(
        {"_id": role_oid},
        {"$addToSet": {"permission_ids": perm_oid}},
    )
    doc = await db[COLLECTION].find_one({"_id": role_oid})
    return RoleInDB(**doc) if doc else None


async def remove_permission_from_role(
    db: AsyncIOMotorDatabase, role_id: str, permission_id: str
) -> Optional[RoleInDB]:
    if not (ObjectId.is_valid(role_id) and ObjectId.is_valid(permission_id)):
        return None

    role_oid = ObjectId(role_id)
    perm_oid = ObjectId(permission_id)

    role_exists = await db[COLLECTION].find_one({"_id": role_oid})
    if not role_exists:
        return None

    perm_exists = await db["permissions"].find_one({"_id": perm_oid})
    if not perm_exists:
        return None

    await db[COLLECTION].update_one(
        {"_id": role_oid},
        {"$pull": {"permission_ids": perm_oid}},
    )
    doc = await db[COLLECTION].find_one({"_id": role_oid})
    return RoleInDB(**doc) if doc else None
