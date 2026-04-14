"""任务执行器注册入口。"""

from __future__ import annotations

from app.core.tasks.image_generation_tasks import ImageGenerationTask
from app.core.tasks.registry import register_task_adapter
from app.core.tasks.video_generation_tasks import VideoGenerationTask


def bootstrap_task_adapters() -> None:
    """注册内置任务执行器（幂等）。"""

    register_task_adapter("image_generation", "openai", ImageGenerationTask._build_openai_impl)
    register_task_adapter("image_generation", "volcengine", ImageGenerationTask._build_volcengine_impl)
    register_task_adapter("video_generation", "openai", VideoGenerationTask._build_openai_impl)
    register_task_adapter("video_generation", "volcengine", VideoGenerationTask._build_volcengine_impl)
