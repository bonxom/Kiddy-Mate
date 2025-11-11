# app/config/database.py

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")

_client = AsyncIOMotorClient(MONGODB_URI)
_db = _client[DB_NAME]


def get_database():
    """Return shared MongoDB database instance."""
    return _db
