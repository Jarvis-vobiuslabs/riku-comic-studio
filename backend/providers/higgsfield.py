import httpx
import asyncio
import os
from pathlib import Path

API_URL = "https://api.higgsfield.ai/api/v2/diffusion"

async def generate_image(prompt: str, api_key: str, save_path: str, width: int = 600, height: int = 900) -> str:
    """Generate an image using Higgsfield API and save it locally."""
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "nano-banana-pro",
        "prompt": prompt,
        "width": width,
        "height": height,
        "num_inference_steps": 30,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        status_url = data.get("status_url") or data.get("url")

        # Poll for completion
        for _ in range(60):
            status_resp = await client.get(status_url, headers=headers)
            status_data = status_resp.json()
            status = status_data.get("status", "")
            if status == "completed":
                image_url = status_data.get("output", [None])[0] or status_data.get("image_url")
                if image_url:
                    img_resp = await client.get(image_url)
                    img_resp.raise_for_status()
                    os.makedirs(os.path.dirname(save_path), exist_ok=True)
                    with open(save_path, "wb") as f:
                        f.write(img_resp.content)
                    return save_path
            elif status == "failed":
                raise Exception(f"Generation failed: {status_data}")
            await asyncio.sleep(2)

        raise Exception("Generation timed out")
