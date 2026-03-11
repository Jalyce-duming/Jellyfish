"""生成任务（图片/视频/等）通用任务表。

设计目标：
- 统一支撑“流式输出”“任务 + 轮询”等多种交付方式
- 进度使用 0-100 的整数，前端轮询时可直接展示
- payload/result 采用 JSON，便于不同模型/供应商扩展
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from sqlalchemy import JSON, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin


class GenerationTaskStatus(str, Enum):
    pending = "pending"
    running = "running"
    streaming = "streaming"
    succeeded = "succeeded"
    failed = "failed"
    cancelled = "cancelled"


class GenerationDeliveryMode(str, Enum):
    streaming = "streaming"  # 长连接分段输出（SSE/WebSocket/HTTP chunked）
    async_polling = "async_polling"  # 任务 + 轮询查询状态


class GenerationTask(Base, TimestampMixin):
    __tablename__ = "generation_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, comment="任务 ID")

    mode: Mapped[GenerationDeliveryMode] = mapped_column(
        String(32),
        nullable=False,
        index=True,
        comment="交付方式：streaming / async_polling / ...",
    )
    status: Mapped[GenerationTaskStatus] = mapped_column(
        String(32),
        nullable=False,
        default=GenerationTaskStatus.pending,
        index=True,
        comment="任务状态",
    )
    progress: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="进度 0-100",
    )

    payload: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
        comment="请求参数（JSON）",
    )
    result: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
        comment="结果（JSON，例如 url、metadata）",
    )
    error: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
        comment="失败原因（为空表示无错误）",
    )

    __table_args__ = (
        # 轮询高频：按 id 主键读最常见；列表/后台清理可按状态与更新时间过滤
        Index("ix_generation_tasks_status_updated_at", "status", "updated_at"),
        Index("ix_generation_tasks_mode_updated_at", "mode", "updated_at"),
    )

