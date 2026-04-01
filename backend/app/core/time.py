from datetime import UTC, datetime


def utc_now() -> datetime:
    """
    Return the current UTC time as a naive datetime.

    The codebase currently relies on naive datetimes in several Mongo/Beanie
    flows. This keeps the existing storage semantics while removing usage of
    `datetime.utcnow()`, which is deprecated on modern Python versions.
    """
    return datetime.now(UTC).replace(tzinfo=None)
