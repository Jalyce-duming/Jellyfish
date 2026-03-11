from __future__ import annotations

import asyncio
import time
import uuid
from typing import Any, Optional, Protocol

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from enum import Enum

from app.models.task import GenerationDeliveryMode, GenerationTask, GenerationTaskStatus
from app.core.task_manager.types import DeliveryMode, TaskRecord, TaskStatus, TaskStatusView


def _now_ts() -> float:
    return time.time()


def _new_id() -> str:
    return uuid.uuid4().hex


def _enum_value(x: object) -> object:
    return x.value if isinstance(x, Enum) else x


def _to_app_mode(mode: str | GenerationDeliveryMode) -> DeliveryMode:
    return DeliveryMode(str(_enum_value(mode)))


def _to_app_status(status: str | GenerationTaskStatus) -> TaskStatus:
    return TaskStatus(str(_enum_value(status)))


def _to_db_mode(mode: DeliveryMode) -> GenerationDeliveryMode:
    return GenerationDeliveryMode(mode.value)


def _to_db_status(status: TaskStatus) -> GenerationTaskStatus:
    return GenerationTaskStatus(status.value)


class TaskStore(Protocol):
    """任务存储抽象：可替换为内存、MySQL/SQLite(通过 SQLAlchemy) 等。"""

    async def create(self, payload: dict[str, Any], mode: DeliveryMode) -> TaskRecord: ...
    async def get(self, task_id: str) -> Optional[TaskRecord]: ...
    async def get_status_view(self, task_id: str) -> Optional[TaskStatusView]: ...
    async def set_status(self, task_id: str, status: TaskStatus) -> None: ...
    async def set_progress(self, task_id: str, progress: int) -> None: ...
    async def set_result(self, task_id: str, result: dict[str, Any]) -> None: ...
    async def set_error(self, task_id: str, error: str) -> None: ...


class InMemoryTaskStore(TaskStore):
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._data: dict[str, TaskRecord] = {}

    async def create(self, payload: dict[str, Any], mode: DeliveryMode) -> TaskRecord:
        async with self._lock:
            task_id = _new_id()
            ts = _now_ts()
            rec = TaskRecord(
                id=task_id,
                mode=mode,
                status=TaskStatus.pending,
                progress=0,
                payload=payload,
                result=None,
                error="",
                created_at_ts=ts,
                updated_at_ts=ts,
            )
            self._data[task_id] = rec
            return rec

    async def get(self, task_id: str) -> Optional[TaskRecord]:
        async with self._lock:
            return self._data.get(task_id)

    async def get_status_view(self, task_id: str) -> Optional[TaskStatusView]:
        async with self._lock:
            rec = self._data.get(task_id)
            if not rec:
                return None
            return TaskStatusView(
                id=rec.id,
                status=rec.status,
                progress=rec.progress,
                result=rec.result,
                error=rec.error,
                updated_at_ts=rec.updated_at_ts,
            )

    async def _update(self, task_id: str, **kwargs: Any) -> None:
        async with self._lock:
            rec = self._data.get(task_id)
            if not rec:
                return
            for k, v in kwargs.items():
                setattr(rec, k, v)
            rec.updated_at_ts = _now_ts()

    async def set_status(self, task_id: str, status: TaskStatus) -> None:
        await self._update(task_id, status=status)

    async def set_progress(self, task_id: str, progress: int) -> None:
        p = max(0, min(100, int(progress)))
        await self._update(task_id, progress=p)

    async def set_result(self, task_id: str, result: dict[str, Any]) -> None:
        await self._update(task_id, result=result)

    async def set_error(self, task_id: str, error: str) -> None:
        await self._update(task_id, error=error or "")


class SqlAlchemyTaskStore(TaskStore):
    """基于 SQLAlchemy AsyncSession 的任务存储（MySQL/SQLite 等均可）。"""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, payload: dict[str, Any], mode: DeliveryMode) -> TaskRecord:
        task_id = _new_id()
        row = GenerationTask(
            id=task_id,
            mode=_to_db_mode(mode),
            status=_to_db_status(TaskStatus.pending),
            progress=0,
            payload=payload,
            result=None,
            error="",
        )
        self.db.add(row)
        await self.db.flush()
        await self.db.refresh(row)
        return TaskRecord(
            id=row.id,
            mode=_to_app_mode(row.mode),
            status=_to_app_status(row.status),
            progress=row.progress,
            payload=row.payload,
            result=row.result,
            error=row.error or "",
            created_at_ts=row.created_at.timestamp() if row.created_at else None,
            updated_at_ts=row.updated_at.timestamp() if row.updated_at else None,
        )

    async def get(self, task_id: str) -> Optional[TaskRecord]:
        row = await self.db.get(GenerationTask, task_id)
        if row is None:
            return None
        return TaskRecord(
            id=row.id,
            mode=_to_app_mode(row.mode),
            status=_to_app_status(row.status),
            progress=row.progress,
            payload=row.payload,
            result=row.result,
            error=row.error or "",
            created_at_ts=row.created_at.timestamp() if row.created_at else None,
            updated_at_ts=row.updated_at.timestamp() if row.updated_at else None,
        )

    async def get_status_view(self, task_id: str) -> Optional[TaskStatusView]:
        # 轮询高频：只选择必要列，减少 IO 与 ORM 开销
        stmt = (
            select(
                GenerationTask.id,
                GenerationTask.status,
                GenerationTask.progress,
                GenerationTask.result,
                GenerationTask.error,
                GenerationTask.updated_at,
            )
            .where(GenerationTask.id == task_id)
            .limit(1)
        )
        res = await self.db.execute(stmt)
        row = res.first()
        if not row:
            return None
        updated_at = row.updated_at
        return TaskStatusView(
            id=row.id,
            status=_to_app_status(row.status),
            progress=int(row.progress),
            result=row.result,
            error=row.error or "",
            updated_at_ts=updated_at.timestamp() if updated_at else None,
        )

    async def _update_columns(self, task_id: str, **kwargs: Any) -> None:
        row = await self.db.get(GenerationTask, task_id)
        if row is None:
            return
        for k, v in kwargs.items():
            setattr(row, k, v)
        await self.db.flush()

    async def set_status(self, task_id: str, status: TaskStatus) -> None:
        await self._update_columns(task_id, status=_to_db_status(status))

    async def set_progress(self, task_id: str, progress: int) -> None:
        p = max(0, min(100, int(progress)))
        await self._update_columns(task_id, progress=p)

    async def set_result(self, task_id: str, result: dict[str, Any]) -> None:
        await self._update_columns(task_id, result=result)

    async def set_error(self, task_id: str, error: str) -> None:
        await self._update_columns(task_id, error=error or "")

