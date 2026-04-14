"""图片 integrations：httpx MockTransport 单测（不发起真实网络请求）。"""

from __future__ import annotations

import json

import httpx
import pytest

from app.core.integrations.openai.images import OpenAIImageApiAdapter
from app.core.integrations.volcengine.images import VolcengineImageApiAdapter
from app.core.tasks.image_generation_types import ImageGenerationInput, InputImageRef
from app.core.tasks.provider_types import ProviderConfig


def _patch_httpx_client(monkeypatch: pytest.MonkeyPatch, transport: httpx.MockTransport) -> None:
    """让各 adapter 内 `import httpx` 后使用的 AsyncClient 走 MockTransport。"""

    real_client = httpx.AsyncClient

    def factory(**kwargs: object) -> httpx.AsyncClient:
        timeout = kwargs.get("timeout", 60.0)
        return real_client(transport=transport, timeout=timeout)  # type: ignore[arg-type]

    monkeypatch.setattr(httpx, "AsyncClient", factory)


@pytest.mark.asyncio
async def test_openai_image_adapter_generations(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["path"] = request.url.path
        captured["body"] = request.content.decode()
        assert request.headers.get("authorization", "").startswith("Bearer ")
        return httpx.Response(
            200,
            json={"data": [{"url": "https://cdn.example.com/1.png"}], "status": "succeeded"},
        )

    _patch_httpx_client(monkeypatch, httpx.MockTransport(handler))
    cfg = ProviderConfig(provider="openai", api_key="sk-test", base_url="https://api.openai.com/v1")
    inp = ImageGenerationInput(prompt="hello", n=1)
    result = await OpenAIImageApiAdapter().generate(cfg=cfg, inp=inp, timeout_s=30.0)
    assert captured["path"].endswith("/images/generations")
    body = json.loads(captured["body"])
    assert body["prompt"] == "hello"
    assert result.provider == "openai"
    assert result.images[0].url == "https://cdn.example.com/1.png"


@pytest.mark.asyncio
async def test_openai_image_adapter_edits_when_references(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/images/edits")
        return httpx.Response(200, json={"data": [{"b64_json": "abc"}]})

    _patch_httpx_client(monkeypatch, httpx.MockTransport(handler))
    cfg = ProviderConfig(provider="openai", api_key="sk-test")
    inp = ImageGenerationInput(
        prompt="edit me",
        n=1,
        images=[InputImageRef(image_url="https://example.com/ref.png")],
    )
    result = await OpenAIImageApiAdapter().generate(cfg=cfg, inp=inp, timeout_s=30.0)
    assert result.images[0].b64_json == "abc"


@pytest.mark.asyncio
async def test_volcengine_image_adapter_generations(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/images/generations")
        payload = json.loads(request.content.decode())
        assert payload["prompt"] == "火山"
        assert payload["n"] == 1
        return httpx.Response(
            200,
            json={
                "data": [{"image_url": "https://volc.example/v.mp4"}],
                "id": "task-xyz",
                "status": "succeeded",
            },
        )

    _patch_httpx_client(monkeypatch, httpx.MockTransport(handler))
    cfg = ProviderConfig(provider="volcengine", api_key="ak-test")
    inp = ImageGenerationInput(prompt="火山", n=1, seed=42)
    result = await VolcengineImageApiAdapter().generate(cfg=cfg, inp=inp, timeout_s=30.0)
    assert result.provider == "volcengine"
    assert result.provider_task_id == "task-xyz"
    assert result.images[0].url == "https://volc.example/v.mp4"
