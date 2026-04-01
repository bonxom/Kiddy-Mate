class TaskLibraryError(Exception):
    """Base error for task library use cases."""


class TaskNotFoundError(TaskLibraryError):
    """Raised when a library task does not exist."""


class TaskLibraryAccessDeniedError(TaskLibraryError):
    """Raised when a non-parent actor attempts to manage the task library."""
