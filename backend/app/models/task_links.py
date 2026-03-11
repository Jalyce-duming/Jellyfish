"""Studio 域与生成任务（GenerationTask）的关联表（方案 B：分表强外键）。

设计目标：
- 不污染 `GenerationTask`（保持 task 模块独立）
- 由 studio 域维护关联关系（Project/Chapter/Shot -> GenerationTask）
- 数据库层面强约束：外键确保引用存在；删除业务对象或任务时自动级联清理关联
"""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.base import TimestampMixin


class ProjectGenerationTaskLink(Base, TimestampMixin):
    __tablename__ = "project_generation_task_links"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="关联行 ID"
    )
    project_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        comment="项目 ID",
    )
    task_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("generation_tasks.id", ondelete="CASCADE"),
        nullable=False,
        comment="生成任务 ID",
    )
    relation_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="",
        comment="关联类型（可选：如 image/video/storyboard），为空表示默认",
    )
    is_adopted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否采用（业务侧是否已采纳该任务结果）",
    )

    __table_args__ = (
        UniqueConstraint("project_id", "task_id", "relation_type", name="uq_proj_task_rel"),
        Index("ix_proj_task_project_id_updated_at", "project_id", "updated_at"),
        Index("ix_proj_task_task_id", "task_id"),
        Index("ix_proj_task_is_adopted_updated_at", "is_adopted", "updated_at"),
    )


class ChapterGenerationTaskLink(Base, TimestampMixin):
    __tablename__ = "chapter_generation_task_links"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="关联行 ID"
    )
    chapter_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=False,
        comment="章节 ID",
    )
    task_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("generation_tasks.id", ondelete="CASCADE"),
        nullable=False,
        comment="生成任务 ID",
    )
    relation_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="",
        comment="关联类型（可选：如 image/video/storyboard），为空表示默认",
    )
    is_adopted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否采用（业务侧是否已采纳该任务结果）",
    )

    __table_args__ = (
        UniqueConstraint("chapter_id", "task_id", "relation_type", name="uq_ch_task_rel"),
        Index("ix_ch_task_chapter_id_updated_at", "chapter_id", "updated_at"),
        Index("ix_ch_task_task_id", "task_id"),
        Index("ix_ch_task_is_adopted_updated_at", "is_adopted", "updated_at"),
    )


class ShotGenerationTaskLink(Base, TimestampMixin):
    __tablename__ = "shot_generation_task_links"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="关联行 ID"
    )
    shot_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("shots.id", ondelete="CASCADE"),
        nullable=False,
        comment="镜头 ID",
    )
    task_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("generation_tasks.id", ondelete="CASCADE"),
        nullable=False,
        comment="生成任务 ID",
    )
    relation_type: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="",
        comment="关联类型（可选：如 image/video/storyboard），为空表示默认",
    )
    is_adopted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="是否采用（业务侧是否已采纳该任务结果）",
    )

    __table_args__ = (
        UniqueConstraint("shot_id", "task_id", "relation_type", name="uq_sh_task_rel"),
        Index("ix_sh_task_shot_id_updated_at", "shot_id", "updated_at"),
        Index("ix_sh_task_task_id", "task_id"),
        Index("ix_sh_task_is_adopted_updated_at", "is_adopted", "updated_at"),
    )

