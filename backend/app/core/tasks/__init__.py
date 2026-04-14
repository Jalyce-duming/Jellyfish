"""Tasks for the skills runtime."""

from app.core.tasks.image_generation_tasks import ImageGenerationTask
from app.core.tasks.image_generation_types import ImageGenerationInput, ImageGenerationResult
from app.core.tasks.provider_types import ProviderConfig, ProviderKey
from app.core.tasks.video_generation_tasks import VideoGenerationTask
from app.core.tasks.video_generation_types import VideoGenerationInput, VideoGenerationResult

__all__ = [
    "ProviderConfig",
    "ProviderKey",
    "VideoGenerationInput",
    "VideoGenerationResult",
    "VideoGenerationTask",
    "ImageGenerationInput",
    "ImageGenerationResult",
    "ImageGenerationTask",
]
