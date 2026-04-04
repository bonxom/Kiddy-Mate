"""
Normalize malformed seed data that was written through insert_many with Link fields.

This script rewrites embedded link-like objects into proper DBRefs for the collections
that Unity-facing child APIs rely on most:
- child_tasks
- child_rewards
- redemption_requests
- game_sessions

It also normalizes a few adjacent seed collections for consistency:
- rewards.created_by
- interaction_logs.child
- reports.child
- child_development_assessments.child
- child_development_assessments.parent

Usage:
    python migrate_seed_link_refs.py
    python migrate_seed_link_refs.py --dry-run
"""

from __future__ import annotations

import argparse
import os
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from bson import DBRef, ObjectId
from pymongo import MongoClient, UpdateOne


def load_env(env_path: Path) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def as_object_id(value: Any) -> ObjectId | None:
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, DBRef):
        return value.id if isinstance(value.id, ObjectId) else None
    if isinstance(value, dict):
        return as_object_id(value.get("_id") or value.get("$id"))
    if isinstance(value, str) and ObjectId.is_valid(value):
        return ObjectId(value)
    return None


def is_same_dbref(value: Any, collection: str, object_id: ObjectId) -> bool:
    return isinstance(value, DBRef) and value.collection == collection and value.id == object_id


def child_signature(document: dict[str, Any]) -> tuple[Any, ...] | None:
    name = document.get("name")
    birth_date = document.get("birth_date")
    username = document.get("username")
    if not name or not birth_date:
        return None
    return (name, birth_date, username)


def task_signature(document: dict[str, Any]) -> tuple[Any, ...] | None:
    title = document.get("title")
    description = document.get("description")
    category = document.get("category")
    task_type = document.get("type")
    difficulty = document.get("difficulty")
    if not title or not description:
        return None
    return (title, description, category, task_type, difficulty)


def reward_signature(document: dict[str, Any]) -> tuple[Any, ...] | None:
    name = document.get("name")
    description = document.get("description")
    reward_type = document.get("type")
    cost_coins = document.get("cost_coins")
    if not name or not description:
        return None
    return (name, description, reward_type, cost_coins)


def game_signature(document: dict[str, Any]) -> tuple[Any, ...] | None:
    name = document.get("name")
    description = document.get("description")
    linked_skill = document.get("linked_skill")
    if not name:
        return None
    return (name, description, linked_skill)


def user_signature(document: dict[str, Any]) -> tuple[Any, ...] | None:
    email = document.get("email")
    return (email,) if email else None


@dataclass
class LookupIndex:
    ids: set[ObjectId] = field(default_factory=set)
    by_signature: dict[tuple[Any, ...], ObjectId] = field(default_factory=dict)
    by_fallback_value: dict[str, list[ObjectId]] = field(default_factory=lambda: defaultdict(list))


def build_index(documents: list[dict[str, Any]], signature_builder, fallback_field: str) -> LookupIndex:
    index = LookupIndex()
    for document in documents:
        object_id = document.get("_id")
        if not isinstance(object_id, ObjectId):
            continue

        index.ids.add(object_id)

        signature = signature_builder(document)
        if signature is not None:
            index.by_signature[signature] = object_id

        fallback_value = document.get(fallback_field)
        if isinstance(fallback_value, str) and fallback_value:
            index.by_fallback_value[fallback_value].append(object_id)

    return index


def resolve_reference_id(
    value: Any,
    *,
    collection_name: str,
    index: LookupIndex,
    signature_builder,
    fallback_field: str,
) -> ObjectId | None:
    object_id = as_object_id(value)
    if object_id in index.ids:
        return object_id

    if isinstance(value, dict):
        signature = signature_builder(value)
        if signature is not None:
            resolved = index.by_signature.get(signature)
            if resolved:
                return resolved

        fallback_value = value.get(fallback_field)
        if isinstance(fallback_value, str):
            candidates = index.by_fallback_value.get(fallback_value, [])
            if len(candidates) == 1:
                return candidates[0]

    if isinstance(value, DBRef) and value.collection == collection_name:
        return value.id if isinstance(value.id, ObjectId) else None

    return None


@dataclass
class MigrationStats:
    collection: str
    total: int = 0
    updated: int = 0
    unchanged: int = 0
    unresolved: list[str] = field(default_factory=list)


def migrate_collection(
    *,
    db,
    collection_name: str,
    field_plans: list[tuple[str, str, LookupIndex, Any, str]],
    dry_run: bool,
) -> MigrationStats:
    stats = MigrationStats(collection=collection_name)
    operations: list[UpdateOne] = []

    for document in db[collection_name].find():
        stats.total += 1
        updates: dict[str, Any] = {}

        for field_name, target_collection, index, signature_builder, fallback_field in field_plans:
            current_value = document.get(field_name)
            if current_value is None:
                continue

            resolved_id = resolve_reference_id(
                current_value,
                collection_name=target_collection,
                index=index,
                signature_builder=signature_builder,
                fallback_field=fallback_field,
            )

            if resolved_id is None:
                stats.unresolved.append(f"{document['_id']}:{field_name}")
                continue

            if not is_same_dbref(current_value, target_collection, resolved_id):
                updates[field_name] = DBRef(target_collection, resolved_id)

        if updates:
            stats.updated += 1
            operations.append(UpdateOne({"_id": document["_id"]}, {"$set": updates}))
        else:
            stats.unchanged += 1

    if operations and not dry_run:
        db[collection_name].bulk_write(operations, ordered=False)

    return stats


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize malformed Beanie Link seed data into DBRefs.")
    parser.add_argument("--env-file", default=str(Path(__file__).with_name(".env")), help="Path to backend .env file")
    parser.add_argument("--dry-run", action="store_true", help="Analyze and print planned changes without writing them")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    load_env(Path(args.env_file))

    database_url = os.environ.get("DATABASE_URL")
    database_name = os.environ.get("DATABASE_NAME", "kiddy_mate_db")
    if not database_url:
        raise RuntimeError("DATABASE_URL was not found in the environment or .env file.")

    client = MongoClient(database_url)
    db = client[database_name]

    children_index = build_index(list(db["children"].find()), child_signature, "name")
    tasks_index = build_index(list(db["tasks"].find()), task_signature, "title")
    rewards_index = build_index(list(db["rewards"].find()), reward_signature, "name")
    games_index = build_index(list(db["mini_games"].find()), game_signature, "name")
    users_index = build_index(list(db["users"].find()), user_signature, "email")

    migration_plan = [
        (
            "child_tasks",
            [
                ("child", "children", children_index, child_signature, "name"),
                ("task", "tasks", tasks_index, task_signature, "title"),
            ],
        ),
        (
            "child_rewards",
            [
                ("child", "children", children_index, child_signature, "name"),
                ("reward", "rewards", rewards_index, reward_signature, "name"),
            ],
        ),
        (
            "redemption_requests",
            [
                ("child", "children", children_index, child_signature, "name"),
                ("reward", "rewards", rewards_index, reward_signature, "name"),
            ],
        ),
        (
            "game_sessions",
            [
                ("child", "children", children_index, child_signature, "name"),
                ("game", "mini_games", games_index, game_signature, "name"),
            ],
        ),
        (
            "rewards",
            [
                ("created_by", "users", users_index, user_signature, "email"),
            ],
        ),
        (
            "interaction_logs",
            [
                ("child", "children", children_index, child_signature, "name"),
            ],
        ),
        (
            "reports",
            [
                ("child", "children", children_index, child_signature, "name"),
            ],
        ),
        (
            "child_development_assessments",
            [
                ("child", "children", children_index, child_signature, "name"),
                ("parent", "users", users_index, user_signature, "email"),
            ],
        ),
    ]

    print("=" * 72)
    print("Seed Link Migration")
    print("=" * 72)
    print(f"Database: {database_name}")
    print(f"Mode    : {'dry-run' if args.dry_run else 'write'}")
    print()

    failed = False
    for collection_name, field_plans in migration_plan:
        stats = migrate_collection(
            db=db,
            collection_name=collection_name,
            field_plans=field_plans,
            dry_run=args.dry_run,
        )

        print(f"[{collection_name}] total={stats.total} updated={stats.updated} unchanged={stats.unchanged}")
        if stats.unresolved:
            failed = True
            unique_unresolved = list(dict.fromkeys(stats.unresolved))
            preview = ", ".join(unique_unresolved[:10])
            print(f"  unresolved={len(unique_unresolved)} -> {preview}")
        else:
            print("  unresolved=0")

    print()
    print("Done.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
