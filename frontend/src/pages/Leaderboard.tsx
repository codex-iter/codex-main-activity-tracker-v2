import { ScrollReveal } from "../components/animations/ScrollReveal";
import SEO from "../components/SEO";
import ClubActivityCalendar from "../components/ClubActivityCalendar";
import { useLeaderboard } from "../hooks/useLeaderboard";
import ClubCommandCenter from "../components/leaderboard/ClubCommandCenter";
import ClubSkillDistribution from "../components/leaderboard/ClubSkillDistribution";
import LeaderboardControls from "../components/leaderboard/LeaderboardControls";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";

export default function Leaderboard() {
  const {
    members,
    clubSummary,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
  } = useLeaderboard();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="bg-background-light min-h-screen font-display text-slate-900 relative overflow-hidden">
      <SEO
        title="Leaderboard | CODEX ITER"
        description="Daily coding leaderboard for CODEX ITER members. Track LeetCode, Codeforces, GitHub, CodeChef, GFG, and HackerRank scores."
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 md:px-12 py-8 sm:py-16 relative z-10 overflow-hidden">
        {/* ── Minimal Glass Hero ── */}
        <ScrollReveal className="mb-8 sm:mb-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center mx-auto gap-2.5 bg-slate-900 text-white px-4 sm:px-6 py-1.5 sm:py-2 mb-4 sm:mb-6 font-bold uppercase tracking-widest text-xs sm:text-sm rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            CODEX
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tight mb-3 sm:mb-4 flex flex-col items-center">
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-medium max-w-lg text-slate-600 px-2">
            Compete with the best and climb your way to the top across GitHub, LeetCode, Codeforces, and HackerRank.
          </p>
        </ScrollReveal>

        {/* ── Club Command Center & Skill Distribution ── */}
        {clubSummary && (
          <ScrollReveal delay={0.05} className="mb-10 sm:mb-14">
            <ClubCommandCenter stats={clubSummary} />
            <ClubSkillDistribution stats={clubSummary} />
          </ScrollReveal>
        )}

        {/* ── Club Activity Calendar ── */}
        <ScrollReveal delay={0.08} className="mb-10 sm:mb-14">
          <ClubActivityCalendar />
        </ScrollReveal>

        {/* ── Date strip ── */}
        <ScrollReveal delay={0.12} className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 opacity-50">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="font-semibold uppercase text-[10px] sm:text-xs tracking-widest text-slate-500 whitespace-nowrap">
              {today}
            </span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>
        </ScrollReveal>

        {/* ── Mode Toggle ── */}
        <ScrollReveal delay={0.13} className="mb-6 flex justify-center w-full">
          <div className="grid grid-cols-3 border-4 border-slate-900 bg-white brutalist-shadow w-full max-w-md">
            {(['GLOBAL', 'DSA', 'DEV'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-2 sm:px-4 py-2 sm:py-3 font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-colors text-center border-r-2 sm:border-r-4 border-slate-900 last:border-r-0 ${
                  sortMode === mode
                    ? "bg-red-500 text-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {mode === 'DSA' ? 'ALGOS' : mode === 'DEV' ? 'DEV' : 'GLOBAL'}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Controls ── */}
        <ScrollReveal delay={0.15}>
          <LeaderboardControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </ScrollReveal>

        {/* ── Leaderboard Table ── */}
        <LeaderboardTable members={members} loading={loading} error={error} isSearchActive={searchQuery.length > 0} sortMode={sortMode} />

        {/* ── Footer note ── */}
        {!loading && !error && members.length > 0 && (
          <ScrollReveal delay={0.1} className="mt-12 pt-8 border-t border-slate-800/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Synced 00:00 & 12:00 UTC</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/> Score = LC + CF + CC + GH + HR</span>
            </div>
          </ScrollReveal>
        )}
      </main>
    </div>
  );
}
