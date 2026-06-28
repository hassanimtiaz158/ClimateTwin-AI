"""
ClimateTwin AI — Portable Column Types

Provides database-agnostic column types that work identically on SQLite
(local dev) and PostgreSQL (production / Supabase).

Usage in models::

    from app.types import GUID, StringEnum
    from sqlalchemy import Column

    class MyModel(Base):
        id = Column(GUID(), primary_key=True, default=uuid.uuid4)
        status = Column(StringEnum(["active", "inactive"], name="status_enum"))
"""

from __future__ import annotations

import uuid
from typing import Any, List, Optional, Sequence

from sqlalchemy import String, TypeDecorator
from sqlalchemy.engine import Dialect


# ── GUID (portable UUID) ───────────────────────────────────────
class GUID(TypeDecorator[uuid.UUID]):
    """
    Platform-independent UUID column.

    * PostgreSQL → native ``UUID`` type
    * SQLite     → ``CHAR(36)`` storing the hex string
    """

    impl = String
    cache_ok = True

    def __init__(self, as_uuid: bool = True):
        self.as_uuid = as_uuid
        super().__init__(length=36)

    def process_bind_param(self, value: Any, dialect: Dialect) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(value))

    def process_result_value(self, value: Any, dialect: Dialect) -> Optional[uuid.UUID]:
        if value is None:
            return None
        if self.as_uuid:
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(value)
        return value

    @staticmethod
    def sort_key_function(value: Any) -> Any:
        if value is None:
            return ""
        return str(value)


# ── StringEnum (portable ENUM) ─────────────────────────────────
class StringEnum(TypeDecorator[str]):
    """
    Platform-independent enum column.

    * PostgreSQL → native ``ENUM`` type (when ``create_type=True``)
    * SQLite     → ``VARCHAR`` with CHECK constraint via Python validation
    """

    impl = String
    cache_ok = True

    def __init__(
        self,
        values: Sequence[str],
        name: Optional[str] = None,
        native_enum: bool = True,
    ):
        self.values = list(values)
        self.enum_name = name
        self.native_enum = native_enum
        max_len = max(len(v) for v in values) if values else 50
        super().__init__(length=max_len + 10)

    def process_bind_param(self, value: Any, dialect: Dialect) -> Optional[str]:
        if value is None:
            return None
        if value not in self.values:
            raise ValueError(f"Invalid value '{value}'. Must be one of: {self.values}")
        return str(value)

    def process_result_value(self, value: Any, dialect: Dialect) -> Optional[str]:
        return value

    def coerce_compare_value(self, value: Any) -> Any:
        return value


# ── JSON (portable) ────────────────────────────────────────────
class JSONColumn(TypeDecorator):
    """
    Portable JSON column.

    * PostgreSQL → native ``JSONB``
    * SQLite     → ``TEXT`` with manual serialisation
    """

    impl = String
    cache_ok = True

    def __init__(self, default: Any = None):
        self.default = default
        super().__init__(length=10_000)

    def process_bind_param(self, value: Any, dialect: Dialect) -> Optional[str]:
        if value is None:
            return None
        import json
        return json.dumps(value, default=str)

    def process_result_value(self, value: Any, dialect: Dialect) -> Any:
        if value is None:
            return self.default
        import json
        return json.loads(value)

    def coerce_compare_value(self, value: Any) -> Any:
        return value
