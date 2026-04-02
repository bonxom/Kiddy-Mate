from __future__ import annotations

from contextvars import ContextVar, Token
import re
from typing import Final


SUPPORTED_LOCALES: Final[set[str]] = {"en", "vi"}
DEFAULT_LOCALE: Final[str] = "en"
_current_locale: ContextVar[str] = ContextVar("current_locale", default=DEFAULT_LOCALE)


_EXACT_EN_TO_VI: Final[dict[str, str]] = {
    "Welcome to KiddyMate API!": "Chao mung ban den voi KiddyMate API!",
    "Could not validate credentials": "Khong the xac thuc thong tin dang nhap.",
    "Forbidden: This endpoint requires parent role.": "API nay chi danh cho phu huynh.",
    "Forbidden: This endpoint requires child role.": "API nay chi danh cho hoc sinh.",
    "Child profile not linked to user account.": "Tai khoan nay chua lien ket voi ho so cua be.",
    "Child profile not found.": "Khong tim thay ho so cua be.",
    "Child not found.": "Khong tim thay be.",
    "Forbidden: You do not own this child profile.": "Ban khong co quyen truy cap ho so cua be nay.",
    "Forbidden: You can only access your own profile.": "Ban chi co the truy cap ho so cua chinh minh.",
    "Forbidden: Invalid user role.": "Vai tro nguoi dung khong hop le.",
    "Either 'user_input' or 'message' field is required": "Can cung cap truong 'user_input' hoac 'message'.",
    "Interaction recorded successfully.": "Da ghi lai tuong tac thanh cong.",
    "Sorry, I'm currently busy. Please ask again later!": "Minh dang ban mot chut. Ban thu lai sau nhe!",
    "Task completed successfully! Waiting for parent verification.": "Nhiem vu da hoan thanh. Dang cho phu huynh xac minh.",
    "Task marked as given up successfully.": "Da danh dau nhiem vu bo cuoc thanh cong.",
    "Reward not found": "Khong tim thay phan thuong.",
    "Reward not found.": "Khong tim thay phan thuong.",
    "Reward is not available": "Phan thuong hien khong kha dung.",
    "Parent account not found for this child": "Khong tim thay tai khoan phu huynh cua be nay.",
    "Forbidden: This reward does not belong to your parent": "Phan thuong nay khong thuoc ve phu huynh cua ban.",
    "Redemption request created. Waiting for parent approval.": "Da tao yeu cau doi thuong. Dang cho phu huynh phe duyet.",
    "Skin equipped successfully.": "Da trang bi vat pham thanh cong.",
    "Game not found.": "Khong tim thay tro choi.",
    "Game session not found.": "Khong tim thay phien choi.",
    "You do not own this game session.": "Ban khong so huu phien choi nay.",
    "Game session recorded successfully.": "Da luu phien choi thanh cong.",
    "Task not found.": "Khong tim thay nhiem vu.",
    "Task not found for this child.": "Khong tim thay nhiem vu cua be nay.",
    "Child task not found.": "Khong tim thay nhiem vu da giao.",
    "Task is already completed and waiting for parent verification.": "Nhiem vu da hoan thanh va dang cho phu huynh xac minh.",
    "Task has already been completed and verified.": "Nhiem vu da hoan thanh va duoc xac minh.",
    "Task has been missed and cannot be started again.": "Nhiem vu da bi bo lo va khong the bat dau lai.",
    "Invalid due_date format. Expected YYYY-MM-DD.": "Dinh dang due_date khong hop le. Dinh dang dung la YYYY-MM-DD.",
    "Report not found.": "Khong tim thay bao cao.",
    "You do not own this report.": "Ban khong so huu bao cao nay.",
    "Report does not belong to this child.": "Bao cao nay khong thuoc ve be nay.",
    "Invalid API key. Please check your NAVER_API_KEY in .env file.": "API key khong hop le. Vui long kiem tra NAVER_API_KEY trong file .env.",
    "NAVER_API_KEY is not configured. Please set NAVER_API_KEY in .env file and restart the server.": "NAVER_API_KEY chua duoc cau hinh. Vui long them NAVER_API_KEY vao file .env va khoi dong lai server.",
    "Skills updated successfully": "Da cap nhat ky nang thanh cong.",
    "No significant changes detected, skills remain the same": "Khong co thay doi dang ke, ky nang duoc giu nguyen.",
    "No categories need task generation": "Khong co nhom nao can sinh them nhiem vu.",
}

_EXACT_VI_TO_EN: Final[dict[str, str]] = {value: key for key, value in _EXACT_EN_TO_VI.items()}

_EN_TO_VI_PATTERNS: Final[tuple[tuple[re.Pattern[str], str], ...]] = (
    (
        re.compile(r"^Insufficient coins\. Need (?P<need>\d+), have (?P<have>\d+)$"),
        "Khong du xu. Can {need}, hien co {have}.",
    ),
    (
        re.compile(r"^Failed to generate report: (?P<reason>.+)$"),
        "Khong the tao bao cao: {reason}",
    ),
    (
        re.compile(r"^Failed to parse report data: (?P<reason>.+)$"),
        "Khong the phan tich du lieu bao cao: {reason}",
    ),
    (
        re.compile(r"^Failed to get emotion analytics: (?P<reason>.+)$"),
        "Khong the lay phan tich cam xuc: {reason}",
    ),
    (
        re.compile(r"^Failed to analyze emotion report and generate tasks: (?P<reason>.+)$"),
        "Khong the phan tich bao cao cam xuc va tao nhiem vu: {reason}",
    ),
    (
        re.compile(r"^Failed to generate tasks: (?P<reason>.+)$"),
        "Khong the tao nhiem vu: {reason}",
    ),
    (
        re.compile(r"^Failed to generate score: (?P<reason>.+)$"),
        "Khong the danh gia diem so: {reason}",
    ),
)


def normalize_locale(value: str | None) -> str:
    if not value:
        return DEFAULT_LOCALE

    lowered = value.strip().lower()
    if not lowered:
        return DEFAULT_LOCALE

    for token in lowered.split(","):
        candidate = token.split(";")[0].strip()
        if not candidate:
            continue
        prefix = candidate.split("-")[0]
        if prefix in SUPPORTED_LOCALES:
            return prefix

    prefix = lowered.split("-")[0]
    if prefix in SUPPORTED_LOCALES:
        return prefix
    return DEFAULT_LOCALE


def set_current_locale(locale: str) -> Token[str]:
    return _current_locale.set(normalize_locale(locale))


def reset_current_locale(token: Token[str]) -> None:
    _current_locale.reset(token)


def get_current_locale() -> str:
    return normalize_locale(_current_locale.get())


def get_current_language_name() -> str:
    return "Vietnamese" if get_current_locale() == "vi" else "English"


def localize_message(english: str, vietnamese: str) -> str:
    return vietnamese if get_current_locale() == "vi" else english


def build_output_language_instruction(*, json_output: bool = False) -> str:
    language_name = get_current_language_name()
    if json_output:
        return (
            f"Write all user-facing values in {language_name}. "
            "Keep JSON keys, enum-like codes, and structural syntax in English unless the prompt explicitly says otherwise."
        )
    return f"Respond in {language_name}."


def translate_message(message: str | None) -> str | None:
    if message is None:
        return None

    locale = get_current_locale()
    if locale == "vi":
        if message in _EXACT_EN_TO_VI:
            return _EXACT_EN_TO_VI[message]
        for pattern, template in _EN_TO_VI_PATTERNS:
            match = pattern.match(message)
            if match:
                return template.format(**match.groupdict())
        return message

    if message in _EXACT_VI_TO_EN:
        return _EXACT_VI_TO_EN[message]
    return message
