"""OpenAI Videos API：请求体与参考图映射。"""

from __future__ import annotations

from typing import Any

from app.core.contracts.video_generation import VideoGenerationInput, _strip_optional_b64


def to_image_data_url(value: str) -> str:
    v = value.strip()
    if v.startswith("data:image/"):
        return v
    return f"data:image/png;base64,{v}"


def pick_input_reference(input_: VideoGenerationInput) -> dict[str, str] | None:
    """OpenAI 仅支持单一 input_reference；优先级：key > first > last。"""
    for raw in (
        _strip_optional_b64(input_.key_frame_base64),
        _strip_optional_b64(input_.first_frame_base64),
        _strip_optional_b64(input_.last_frame_base64),
    ):
        if raw:
            return {"image_url": to_image_data_url(raw)}
    return None


def build_create_video_body(input_: VideoGenerationInput) -> dict[str, Any]:
    body: dict[str, Any] = {"prompt": input_.prompt or ""}
    if input_.model:
        body["model"] = input_.model
    if input_.size:
        body["size"] = input_.size
    if input_.seconds:
        body["seconds"] = str(int(input_.seconds))

    ref = pick_input_reference(input_)
    if ref:
        body["input_reference"] = ref
    return body
