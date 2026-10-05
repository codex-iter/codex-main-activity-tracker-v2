import asyncio
import logging
import aiohttp

log = logging.getLogger(__name__)

REQUEST_TIMEOUT = 15

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}

async def safe_fetch(
    session: aiohttp.ClientSession,
    url: str,
    *,
    method: str = "GET",
    headers: dict | None = None,
    json_body: dict | None = None,
    max_retries: int = 3,
) -> dict:
    """
    Thin async wrapper around aiohttp requests.
    - Always attaches BROWSER_HEADERS (merged with any extra headers).
    - Applies REQUEST_TIMEOUT via aiohttp.ClientTimeout.
    - Retries automatically on HTTP 429 Too Many Requests with exponential backoff.
    - Returns parsed JSON dict on success, empty dict on any error.
    """
    merged_headers = {**BROWSER_HEADERS, **(headers or {})}
    timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
    
    for attempt in range(max_retries):
        try:
            if method.upper() == "POST":
                async with session.post(
                    url, headers=merged_headers, json=json_body, timeout=timeout
                ) as resp:
                    if resp.status == 429:
                        log.warning("    HTTP 429 fetching %s (Attempt %d/%d) — Retrying...", url, attempt + 1, max_retries)
                        await asyncio.sleep(2 ** attempt)
                        continue
                    resp.raise_for_status()
                    return await resp.json(content_type=None)
            else:
                async with session.get(
                    url, headers=merged_headers, timeout=timeout
                ) as resp:
                    if resp.status == 429:
                        log.warning("    HTTP 429 fetching %s (Attempt %d/%d) — Retrying...", url, attempt + 1, max_retries)
                        await asyncio.sleep(2 ** attempt)
                        continue
                    resp.raise_for_status()
                    return await resp.json(content_type=None)
        except asyncio.TimeoutError:
            log.warning("    TIMEOUT fetching %s", url)
            return {}
        except aiohttp.ClientResponseError as exc:
            log.warning("    HTTP %s fetching %s — %s", exc.status, url, exc.message)
            return {}
        except Exception as exc:  # noqa: BLE001
            log.warning("    ERROR fetching %s — %s", url, exc)
            return {}
            
    return {}

def _safe_int(value, default: int = 0) -> int:
    """Convert value to int, returning default on None / TypeError / ValueError."""
    try:
        return int(value) if value is not None else default
    except (TypeError, ValueError):
        return default

def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value) if value is not None else default
    except (TypeError, ValueError):
        return default
