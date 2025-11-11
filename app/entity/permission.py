from typing import Optional
from pydantic import BaseModel
from .common import MongoModel


class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class PermissionInDB(MongoModel, PermissionBase):
    pass
