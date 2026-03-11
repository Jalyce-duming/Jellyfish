"""影视技能运行时：数据结构（schemas）、技能实现（prompt + 输出模型）与抽象基类/实现类。

- 数据结构与枚举见 schemas。
- 技能说明文档在 backend/skills/*.md。
- 抽取流程：通过 ExtractionSkillBase 子类加载 skill、调用 agent、格式化输出。
"""

from app.core.skills_runtime.schemas import (
    Character,
    EvidenceSpan,
    Location,
    Prop,
    ProjectCinematicBreakdown,
    Scene,
    Shot,
    Transition,
    Uncertainty,
)
from app.core.skills_runtime.film_entity_extractor import (
    FILM_ENTITY_EXTRACTION_PROMPT,
    FilmEntityExtractionResult,
    TextChunk,
)
from app.core.skills_runtime.film_shotlist_storyboarder import (
    FILM_SHOTLIST_PROMPT,
    FilmShotlistResult,
)
from app.core.skills_runtime.base import (
    SKILL_REGISTRY,
    ExtractionSkillBase,
    KeyInfoExtractorBase,
    ShotlistExtractorBase,
    FilmEntityExtractor,
    FilmShotlistStoryboarder,
)
from app.core.skills_runtime.tasks import FilmEntityExtractionTask, FilmShotlistTask

__all__ = [
    # schemas
    "Character",
    "EvidenceSpan",
    "Location",
    "Prop",
    "ProjectCinematicBreakdown",
    "Scene",
    "Shot",
    "Transition",
    "Uncertainty",
    # film entity extraction
    "FILM_ENTITY_EXTRACTION_PROMPT",
    "FilmEntityExtractionResult",
    "TextChunk",
    # film shotlist
    "FILM_SHOTLIST_PROMPT",
    "FilmShotlistResult",
    # base & registry
    "SKILL_REGISTRY",
    "ExtractionSkillBase",
    "KeyInfoExtractorBase",
    "ShotlistExtractorBase",
    "FilmEntityExtractor",
    "FilmShotlistStoryboarder",
    # tasks
    "FilmEntityExtractionTask",
    "FilmShotlistTask",
]
