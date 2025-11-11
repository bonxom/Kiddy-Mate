from typing import List, Optional
from pydantic import BaseModel, Field
from .common import MongoModel, PyObjectId


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    permission_names: List[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_names: Optional[List[str]] = None


class RoleInDB(MongoModel, RoleBase):
    permission_ids: List[PyObjectId] = Field(default_factory=list)
