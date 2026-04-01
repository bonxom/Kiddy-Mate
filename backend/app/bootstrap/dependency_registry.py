from fastapi import FastAPI


def register_dependencies(app: FastAPI) -> None:
    """
    Central place for dependency overrides or container wiring.

    The refactored backend uses explicit FastAPI dependencies in thin
    controllers. Container wiring can be introduced here later if the
    application moves to a dedicated DI mechanism.
    """
    return None
