from __future__ import annotations

import logging

from ai_gateway.logging_utils import REDACTED, SecretRedactionFilter, configure_logging, sanitize_log_message


def test_sanitize_log_message_redacts_secrets() -> None:
    message = (
        "HTTP Request: POST "
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        "?key=AIzaSyExampleSecret HTTP/1.1 200 OK "
        "Authorization: Bearer child-token-secret "
        "GEMINI_API_KEY=another-secret "
        'and payload {"private_key":"super-secret-private-key"}'
    )

    sanitized = sanitize_log_message(message)

    assert "AIzaSyExampleSecret" not in sanitized
    assert "child-token-secret" not in sanitized
    assert "another-secret" not in sanitized
    assert "super-secret-private-key" not in sanitized
    assert REDACTED in sanitized


def test_secret_redaction_filter_formats_and_redacts_httpx_style_logs() -> None:
    record = logging.LogRecord(
        name="httpx",
        level=logging.INFO,
        pathname=__file__,
        lineno=12,
        msg='HTTP Request: %s %s "%s %d %s"',
        args=(
            "POST",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=test-secret",
            "HTTP/1.1",
            200,
            "OK",
        ),
        exc_info=None,
    )

    assert SecretRedactionFilter().filter(record) is True
    assert "test-secret" not in record.msg
    assert REDACTED in record.msg
    assert record.args == ()


def test_configure_logging_raises_noisy_http_loggers_to_warning() -> None:
    configure_logging("INFO")

    assert logging.getLogger("httpx").level == logging.WARNING
    assert logging.getLogger("httpcore").level == logging.WARNING
