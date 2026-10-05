import asyncio
import logging
import aiohttp
from .utils import safe_fetch, _safe_int

log = logging.getLogger(__name__)

cc_semaphore = asyncio.Semaphore(1)

async def fetch_codechef(session: aiohttp.ClientSession, handle: str) -> dict:
    """
    Fetches CodeChef metrics across four endpoints concurrently. All data inside `data: {}`.

    1. GET /{handle}          -> data.{ currentRating, maxRating, totalSolved, totalActiveDays }
    2. GET /{handle}/heatmap  -> data.{ totalSubmissions, currentStreak, longestStreak }
    3. GET /{handle}/contests -> data.{ count (contests attended) }
    4. GET /{handle}/stats    -> data.{ topicAnalysis: [{topic, count}] }

    Returns: {
      codechef_rating, codechef_max_rating, codechef_solved,
      cc_active_days, cc_total_submissions, cc_current_streak, cc_max_streak,
      cc_contests_attended, cc_topics
    }
    """
    import urllib.parse
    encoded_handle = urllib.parse.quote(handle)
    BASE = f"https://codechef-stats.tashif.codes/{encoded_handle}"

    async with cc_semaphore:
        try:
            profile_resp = await safe_fetch(session, BASE)
            await asyncio.sleep(0.5)
            heatmap_resp = await safe_fetch(session, f"{BASE}/heatmap")
            await asyncio.sleep(0.5)
            contests_resp = await safe_fetch(session, f"{BASE}/contests")
            await asyncio.sleep(0.5)
            stats_resp = await safe_fetch(session, f"{BASE}/stats")
        finally:
            await asyncio.sleep(1.0)

    # 1. Profile summary
    profile = profile_resp.get("data") or {}
    cc_rating = _safe_int(profile.get("currentRating"))
    cc_max_rating = _safe_int(profile.get("maxRating"))
    cc_solved = _safe_int(profile.get("totalSolved"))
    cc_active_days = _safe_int(profile.get("totalActiveDays"))

    # 2. Heatmap -> streak & submission counts
    heatmap = heatmap_resp.get("data") or {}
    cc_total_subs = _safe_int(heatmap.get("totalSubmissions"))
    cc_current_streak = _safe_int(heatmap.get("currentStreak"))
    cc_max_streak = _safe_int(heatmap.get("longestStreak"))
    # Prefer heatmap active days as it's more granular
    if heatmap.get("totalActiveDays"):
        cc_active_days = _safe_int(heatmap.get("totalActiveDays"))

    # 3. Contests attended
    contests_data = contests_resp.get("data") or {}
    cc_contests = _safe_int(contests_data.get("count"))
    # If the contests endpoint has a better maxRating, prefer it
    if contests_data.get("maxRating"):
        cc_max_rating = _safe_int(contests_data.get("maxRating"))

    # 4. Topic analysis
    stats_data = stats_resp.get("data") or {}
    cc_topics = {
        item["topic"]: item["count"]
        for item in stats_data.get("topicAnalysis", [])
        if item.get("topic")
    }

    result = {
        "codechef_rating": cc_rating,
        "codechef_max_rating": cc_max_rating,
        "codechef_solved": cc_solved,
        "cc_active_days": cc_active_days,
        "cc_total_submissions": cc_total_subs,
        "cc_current_streak": cc_current_streak,
        "cc_max_streak": cc_max_streak,
        "cc_contests_attended": cc_contests,
        "cc_topics": cc_topics,
    }
    log.info("    ✓ CodeChef     -> rating=%d solved=%d streak=%d",
             cc_rating, cc_solved, cc_current_streak)
    return result
