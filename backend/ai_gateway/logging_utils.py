from __future__ import annotations

import logging
import re

REDACTED = "[REDACTED]"
SENSITIVE_VALUE_PATTERNS = (
    re.compile(r"([?&](?:key|api_key|apikey|access_token|token|signature)=)([^&\s\"']+)", re.IGNORECASE),
    re.compile(r"((?:GEMINI_API_KEY|GOOGLE_SERVICE_ACCOUNT_JSON_B64|SECRET_KEY|NAVER_API_KEY)\s*=\s*)([^\s\"']+)", re.IGNORECASE),
    re.compile(r"(Bearer\s+)([A-Za-z0-9\-._~+/=]+)", re.IGNORECASE),
    re.compile(r'((?:authorization|Authorization)["\':=\s]+Bearer\s+)([A-Za-z0-9\-._~+/=]+)', re.IGNORECASE),
    re.compile(r'(("private_key"\s*:\s*")([^"]+)("))', re.IGNORECASE),
)

NOISY_LOGGERS = (
    "httpx",
    "httpcore",
    "google.auth",
    "google.auth.transport.requests",
)


def sanitize_log_message(message: str) -> str:
    sanitized = message
    for pattern in SENSITIVE_VALUE_PATTERNS:
        if pattern.groups == 4:
            sanitized = pattern.sub(r"\2" + REDACTED + r"\4", sanitized)
            continue

        sanitized = pattern.sub(r"\1" + REDACTED, sanitized)
    return sanitized


class SecretRedactionFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = sanitize_log_message(record.getMessage())
        record.args = ()
        return True


def _install_redaction_filter(logger: logging.Logger) -> None:
    if not any(isinstance(existing_filter, SecretRedactionFilter) for existing_filter in logger.filters):
        logger.addFilter(SecretRedactionFilter())

    for handler in logger.handlers:
        if not any(isinstance(existing_filter, SecretRedactionFilter) for existing_filter in handler.filters):
            handler.addFilter(SecretRedactionFilter())


def configure_logging(level: str) -> None:
    resolved_level = getattr(logging, (level or "INFO").upper(), logging.INFO)
    root_logger = logging.getLogger()

    if not root_logger.handlers:
        logging.basicConfig(
            level=resolved_level,
            format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        )
        root_logger = logging.getLogger()
    else:
        root_logger.setLevel(resolved_level)

    _install_redaction_filter(root_logger)

    for logger_name in NOISY_LOGGERS:
        noisy_logger = logging.getLogger(logger_name)
        noisy_logger.setLevel(logging.WARNING)
        _install_redaction_filter(noisy_logger)
