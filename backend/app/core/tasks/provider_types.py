"""任务执行层供应商公共类型。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ProviderKey = Literal["openai", "volcengine"]


@dataclass(frozen=True, slots=True)
class ProviderConfig:
    """任务执行时所需的供应商配置。"""

    provider: ProviderKey
    api_key: str
    base_url: str | None = None
