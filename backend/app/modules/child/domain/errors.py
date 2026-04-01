class ChildApplicationError(Exception):
    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class ChildNotFoundError(ChildApplicationError):
    status_code = 404


class ChildForbiddenError(ChildApplicationError):
    status_code = 403


class ChildUnauthorizedError(ChildApplicationError):
    status_code = 401


class ChildValidationError(ChildApplicationError):
    status_code = 400
