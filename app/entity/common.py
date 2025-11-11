# app/entity/common.py

from typing import Any
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from pydantic_core import core_schema
from pydantic.json_schema import JsonSchemaValue


class PyObjectId(ObjectId):
    """
    Custom ObjectId type compatible with Pydantic v2.

    - Accepts both str and ObjectId as input.
    - Validates format.
    - Serializes to str in JSON responses.
    """

    @classmethod
    def validate(cls, v: Any) -> "PyObjectId":
        # Already an ObjectId?
        if isinstance(v, ObjectId):
            return cls(str(v))
        # String that looks like an ObjectId?
        if isinstance(v, str) and ObjectId.is_valid(v):
            return cls(v)
        raise TypeError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler) -> core_schema.CoreSchema:
        """
        Defines how this type is validated/serialized by Pydantic v2.
        - For JSON input: expect string.
        - For Python input (e.g. from Mongo): accept ObjectId or str, run validate().
        - For output: always serialize as string.
        """
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.no_info_after_validator_function(
                cls.validate,
                core_schema.union_schema(
                    [
                        core_schema.is_instance_schema(ObjectId),
                        core_schema.str_schema(),
                    ]
                ),
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v),
                when_used="json",
            ),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        core_schema_: core_schema.CoreSchema,
        handler,
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema_)
        json_schema.update(type="string")
        return json_schema


class MongoModel(BaseModel):
    """
    Base model for Mongo documents:
    - Maps Mongo `_id` <-> `id` field.
    - Uses PyObjectId with proper JSON serialization.
    """

    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
