"""火山方舟视频：content 与 ratio。"""

from __future__ import annotations

from typing import Any

from app.core.integrations.openai.video_payload import to_image_data_url
from app.core.contracts.video_generation import VideoGenerationInput, _strip_optional_b64


def volcengine_ratio(size: str | None) -> str:
    if not size or not str(size).strip():
        return "adaptive"
    s = str(size).strip()
    if s.lower() == "adaptive" or ":" in s:
        return s
    return "adaptive"


def build_content(input_: VideoGenerationInput) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    prompt = (input_.prompt or "").strip()
    if prompt:
        items.append({"type": "text", "text": prompt})

    ff = _strip_optional_b64(input_.first_frame_base64)
    if ff:
        items.append(
            {
                "type": "image_url",
                "role": "first_frame",
                "image_url": {"url": to_image_data_url(ff)},
            }
        )
    lf = _strip_optional_b64(input_.last_frame_base64)
    if lf:
        items.append(
            {
                "type": "image_url",
                "role": "last_frame",
                "image_url": {"url": to_image_data_url(lf)},
            }
        )
    kf = _strip_optional_b64(input_.key_frame_base64)
    if kf:
        items.append(
            {
                "type": "image_url",
                "role": "key_frame",
                "image_url": {"url": to_image_data_url(kf)},
            }
        )
    return items


def build_create_task_body(input_: VideoGenerationInput) -> dict[str, Any]:
    content = build_content(input_)
    if not content:
        raise RuntimeError("Volcengine video requires non-empty content (prompt and/or reference frames)")

    body: dict[str, Any] = {
        "content": content,
        "ratio": volcengine_ratio(input_.size),
    }
    if input_.model:
        body["model"] = input_.model
    if input_.seconds is not None:
        body["duration"] = int(input_.seconds)
    return body
