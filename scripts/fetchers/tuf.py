import asyncio
import logging
import aiohttp
from .utils import _safe_int, BROWSER_HEADERS, REQUEST_TIMEOUT

log = logging.getLogger(__name__)

tuf_semaphore = asyncio.Semaphore(1)

async def make_tuf_request(session: aiohttp.ClientSession, url: str, max_retries: int = 3) -> dict:
    """
    Makes a request to takeUforward with exponential backoff on 429/503.
    Limits concurrency using a module-level semaphore and pads requests with a 1s delay.
    """
    for attempt in range(1, max_retries + 1):
        async with tuf_semaphore:
            timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
            try:
                async with session.get(url, headers=BROWSER_HEADERS, timeout=timeout) as resp:
                    if resp.status in (429, 503):
                        log.warning("    TUF HTTP %s on %s (Attempt %d/%d)", resp.status, url, attempt, max_retries)
                        if attempt < max_retries:
                            backoff = 2 ** attempt
                            await asyncio.sleep(backoff)
                            continue
                        return {}
                    
                    # Graceful fallback for non-existent users
                    if resp.status in (400, 404):
                        log.info("    TUF HTTP %s for %s (Likely invalid handle)", resp.status, url)
                        return {}

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
            finally:
                # Ensure we never flood TUF, minimum 1.0s delay between any requests
                await asyncio.sleep(1.0)
                
    return {}

async def fetch_tuf(session: aiohttp.ClientSession, handle: str) -> dict:
    """
    Fetches takeUforward metrics across endpoints concurrently.
    
    Returns: {
      tuf_solved, tuf_easy, tuf_medium, tuf_hard
    }
    """
    import urllib.parse
    encoded_handle = urllib.parse.quote(handle)
    profile_data, stats_data = await asyncio.gather(
        make_tuf_request(session, f"https://tuf-stats.tashif.codes/{encoded_handle}/profile"),
        make_tuf_request(session, f"https://tuf-stats.tashif.codes/{encoded_handle}/stats"),
    )

    tuf_solved = 0
    tuf_easy = 0
    tuf_medium = 0
    tuf_hard = 0

    if stats_data and stats_data.get("success"):
        data = stats_data.get("data", {})
        tuf_solved = _safe_int(data.get("totalSolved"))
        
        diff = data.get("byDifficulty", {})
        tuf_easy = _safe_int(diff.get("easy"))
        tuf_medium = _safe_int(diff.get("medium"))
        tuf_hard = _safe_int(diff.get("hard"))

    result = {
        "tuf_solved": tuf_solved,
        "tuf_easy": tuf_easy,
        "tuf_medium": tuf_medium,
        "tuf_hard": tuf_hard,
    }
    log.info("    ✓ TUF          -> %s", result)
    return result
