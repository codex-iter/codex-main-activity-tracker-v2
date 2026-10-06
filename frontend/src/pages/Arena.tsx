import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";
import { ScrollReveal } from "../components/animations/ScrollReveal";
import { getMonthlyLeaderboard } from "../services/codexApi";
import type { MonthlyLeaderboardEntry } from "../services/codexApi";

type ArenaCategory = "ALL" | "DSA" | "DEV";

export default function Arena() {
  const [data, setData] = useState<MonthlyLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ArenaCategory>("ALL");
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getMonthlyLeaderboard();
        setData(res || []);
      } catch (e) {
        console.error("[Arena] Error fetching monthly leaderboard:", e);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" }).toUpperCase();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = endOfMonth.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diff / (1000 * 3600 * 24));

  const dsaSorted = [...data].sort((a, b) => (b.monthly_dsa_score || 0) - (a.monthly_dsa_score || 0));
  const devSorted = [...data].sort((a, b) => (b.monthly_dev_score || 0) - (a.monthly_dev_score || 0));

  const totalCombatants = data.length;
  const totalDsaSolved = data.reduce((acc, m) => acc + (m.monthly_problems_solved || 0), 0);
  const totalDevCommits = data.reduce((acc, m) => acc + (m.monthly_commits || 0), 0);

  // Top Leaders for Duel Clash Banner
  const topDsaLeader = dsaSorted[0];
  const topDevLeader = devSorted[0];

  // Helper for Rank Titles
  const getRankTitle = (rank: number) => {
    if (rank === 1) return { title: "👑 APEX LEGEND", color: "bg-black text-[#FACC15]" };
    if (rank === 2) return { title: "⚔️ MASTER GLADIATOR", color: "bg-slate-900 text-slate-100" };
    if (rank === 3) return { title: "🥉 MASTER WARRIOR", color: "bg-amber-900 text-amber-200" };
    if (rank <= 5) return { title: "💎 DIAMOND WARRIOR", color: "bg-[#0707f2] text-white" };
    return { title: "⚡ CONTENDER", color: "bg-slate-200 text-slate-800" };
  };

  // Helper for Streak Badges
  const getStreakBadge = (streak: number) => {
    if (streak >= 14) return { label: "💥 RAMPAGE", style: "bg-red-600 text-white animate-pulse" };
    if (streak >= 7) return { label: "⚡ UNSTOPPABLE", style: "bg-amber-500 text-black font-black" };
    if (streak >= 3) return { label: "🔥 ON FIRE", style: "bg-orange-500 text-white" };
    return null;
  };

  // Helper for Top 3 Metallic Styling
  const getPodiumStyle = (rank: number, isDsa: boolean) => {
    if (rank === 1) {
      return {
        bg: isDsa ? "bg-[#FACC15]" : "bg-[#0707f2]",
        textColor: isDsa ? "text-slate-900" : "text-white",
        badgeBg: "bg-black text-[#FACC15]",
        badgeIcon: "👑 1ST",
        border: "border-4 border-slate-900",
        shadow: "shadow-[8px_8px_0px_0px_#0f172a]",
        subText: isDsa ? "text-slate-900/80" : "text-slate-200",
      };
    }
    if (rank === 2) {
      return {
        bg: "bg-slate-200",
        textColor: "text-slate-900",
        badgeBg: "bg-slate-900 text-slate-100",
        badgeIcon: "🥈 2ND",
        border: "border-4 border-slate-900",
        shadow: "shadow-[6px_6px_0px_0px_#0f172a]",
        subText: "text-slate-700",
      };
    }
    if (rank === 3) {
      return {
        bg: "bg-amber-600",
        textColor: "text-white",
        badgeBg: "bg-black text-amber-300",
        badgeIcon: "🥉 3RD",
        border: "border-4 border-slate-900",
        shadow: "shadow-[6px_6px_0px_0px_#0f172a]",
        subText: "text-amber-100",
      };
    }
    return {
      bg: "bg-white",
      textColor: "text-slate-900",
      badgeBg: "bg-slate-100 text-slate-900 border border-slate-900",
      badgeIcon: `#${rank}`,
      border: "border-2 sm:border-4 border-slate-900",
      shadow: "shadow-[4px_4px_0px_0px_#0f172a]",
      subText: "text-slate-500",
    };
  };

  return (
    <div className="min-h-screen bg-background-light font-display text-slate-900 pb-24 relative selection:bg-black selection:text-white overflow-hidden">
      <SEO
        title="The Arena | CODEX ITER Monthly Esports"
        description="Monthly CODEX Arena battleground. Compete in Algorithms (DSA) and Development to claim the top podium places!"
      />

      {/* ── LIVE BATTLE TICKER MARQUEE ── */}
      <div className="w-full bg-slate-900 text-white border-b-4 border-slate-900 py-2 font-mono text-xs font-bold overflow-hidden whitespace-nowrap z-50 relative select-none">
        <div className="inline-flex animate-marquee gap-8">
          <span>⚡ LIVE BATTLE MARQUEE: SEASON {monthName} IN FULL EFFECT</span>
          <span>🔥 TOP ALGO WARRIOR: {topDsaLeader ? topDsaLeader.full_name : '—'} ({topDsaLeader?.monthly_dsa_score || 0} XP)</span>
          <span>🛠️ TOP DEV WARRIOR: {topDevLeader ? topDevLeader.full_name : '—'} ({topDevLeader?.monthly_dev_score || 0} XP)</span>
          <span>⚔️ {daysRemaining} DAYS REMAINING TO CLAIM APEX LEGEND TITLE</span>
          <span>💥 KEEP CODING & COMMITTING TO LEAP IN RANK!</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-3 sm:p-8 md:p-12 relative z-10">
        {/* ── Arcade / Esports Cyber Header ── */}
        <ScrollReveal className="mb-8 sm:mb-12">
          <div className="border-4 border-slate-900 p-5 sm:p-10 bg-white brutalist-shadow relative overflow-hidden">
            {/* Background Cyber Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Swords Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[200px] sm:text-[320px] text-slate-900">
                swords
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-start gap-4 sm:gap-6">
              {/* Top Row: Badges + Rank Mechanism Button */}
              <div className="w-full flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                  <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 sm:px-4 py-1 font-mono font-bold text-xs uppercase border border-slate-900 brutalist-shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    SEASON: ACTIVE COMBAT
                  </div>
                  <div className="bg-[#FACC15] text-slate-900 px-3 sm:px-4 py-1 font-mono font-black text-xs uppercase border-2 border-slate-900 brutalist-shadow-sm">
                    ⚡ {monthName} LEAGUE
                  </div>
                </div>

                {/* ── RANK MECHANISM BUTTON ── */}
                <button
                  onClick={() => setIsRankModalOpen(true)}
                  className="bg-slate-900 hover:bg-[#0707f2] text-white font-mono font-black text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2 border-2 border-slate-900 brutalist-shadow-sm flex items-center gap-2 transition-all cursor-pointer active:translate-y-0.5"
                >
                  <span className="text-base sm:text-lg">❓</span>
                  <span className="hidden sm:inline">RANK MECHANISM</span>
                  <span className="sm:hidden">RULES</span>
                </button>
              </div>

              {/* Title Header */}
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tight uppercase leading-none">
                THE <span className="text-red-500 underline decoration-4 underline-offset-8">ARENA</span>
              </h1>

              {/* HUD Countdown & Stats Bar */}
              <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t-4 border-slate-900 mt-2">
                <div className="inline-flex items-center gap-3 bg-white text-slate-900 font-black px-4 sm:px-6 py-2.5 text-lg sm:text-2xl border-4 border-slate-900 brutalist-shadow">
                  <span className="material-symbols-outlined text-red-500 text-2xl sm:text-3xl animate-bounce">
                    timer
                  </span>
                  <span>RESET IN: <span className="text-red-500 font-mono">{daysRemaining} DAYS</span></span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center font-mono">
                  <div className="bg-slate-100 p-2 sm:px-4 sm:py-2 border-2 border-slate-900 brutalist-shadow-sm">
                    <div className="text-[9px] sm:text-xs font-bold text-slate-500">WARRIORS</div>
                    <div className="text-sm sm:text-xl font-black">{totalCombatants}</div>
                  </div>
                  <div className="bg-slate-100 p-2 sm:px-4 sm:py-2 border-2 border-slate-900 brutalist-shadow-sm">
                    <div className="text-[9px] sm:text-xs font-bold text-slate-500">DSA SOLVED</div>
                    <div className="text-sm sm:text-xl font-black text-red-600">{totalDsaSolved}</div>
                  </div>
                  <div className="bg-slate-100 p-2 sm:px-4 sm:py-2 border-2 border-slate-900 brutalist-shadow-sm">
                    <div className="text-[9px] sm:text-xs font-bold text-slate-500">COMMITS</div>
                    <div className="text-sm sm:text-xl font-black text-blue-600">{totalDevCommits}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── TOP #1 DIVISION CHAMPIONS BANNER ── */}
        {!isLoading && topDsaLeader && topDevLeader && (
          <ScrollReveal delay={0.03} className="mb-10">
            <div className="border-4 border-slate-900 bg-slate-900 text-white p-5 sm:p-6 brutalist-shadow relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4">
                <span className="font-mono text-xs font-black uppercase text-[#FACC15] tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                  DIVISION CHAMPIONS • {monthName} LEAGUE
                </span>
                <span className="font-mono text-[10px] text-slate-300 uppercase hidden sm:inline">CURRENT #1 LEADERS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* #1 Algo Champion Card */}
                <div className="flex items-center justify-between bg-red-950/80 border-2 border-red-500 p-4 brutalist-shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 border-2 border-white bg-slate-800 overflow-hidden font-black text-white text-xl flex items-center justify-center">
                        {topDsaLeader.avatar_url ? (
                          <img src={topDsaLeader.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          topDsaLeader.full_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="absolute -top-2 -right-2 text-lg">👑</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-black text-red-400 uppercase tracking-wide">⚔️ #1 ALGORITHMS LEADER</div>
                      <div className="text-lg sm:text-xl font-black truncate uppercase text-white">{topDsaLeader.full_name}</div>
                      <div className="text-[10px] font-mono text-slate-300">{topDsaLeader.monthly_problems_solved || 0} PROBLEMS SOLVED</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-3 border-l border-red-800/80">
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#FACC15]">{Math.floor(topDsaLeader.monthly_dsa_score || 0)}</div>
                    <div className="text-[9px] font-mono text-red-300 uppercase font-bold">DSA XP</div>
                  </div>
                </div>

                {/* #1 Dev Champion Card */}
                <div className="flex items-center justify-between bg-blue-950/80 border-2 border-blue-500 p-4 brutalist-shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 border-2 border-white bg-slate-800 overflow-hidden font-black text-white text-xl flex items-center justify-center">
                        {topDevLeader.avatar_url ? (
                          <img src={topDevLeader.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          topDevLeader.full_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="absolute -top-2 -right-2 text-lg">👑</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-black text-blue-400 uppercase tracking-wide">🛠️ #1 DEV LEADER</div>
                      <div className="text-lg sm:text-xl font-black truncate uppercase text-white">{topDevLeader.full_name}</div>
                      <div className="text-[10px] font-mono text-slate-300">{topDevLeader.monthly_commits || 0} COMMITS</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-3 border-l border-blue-800/80">
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#FACC15]">{Math.floor(topDevLeader.monthly_dev_score || 0)}</div>
                    <div className="text-[9px] font-mono text-blue-300 uppercase font-bold">DEV XP</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Category Filters & Scroll Anchor ── */}
        <ScrollReveal delay={0.05} className="mb-8 flex justify-center">
          <div id="leaderboard-table" className="grid grid-cols-3 border-4 border-slate-900 bg-white brutalist-shadow w-full max-w-lg scroll-mt-24">
            {(["ALL", "DSA", "DEV"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-6 py-2.5 sm:py-3 font-black text-xs sm:text-sm tracking-wider uppercase transition-all text-center border-r-2 sm:border-r-4 border-slate-900 last:border-r-0 ${
                  activeCategory === cat
                    ? "bg-[#0707f2] text-white shadow-[inset_0px_0px_0px_2px_#0f172a]"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat === "DSA" ? "⚔️ ALGOS" : cat === "DEV" ? "🛠️ DEV" : "🔥 ALL BATTLES"}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Arena Battleground Columns ── */}
        {isLoading ? (
          <div className="text-center text-slate-900 font-black text-3xl sm:text-5xl animate-pulse uppercase tracking-widest my-24 border-4 border-slate-900 p-12 bg-white brutalist-shadow">
            ⚔️ INITIALIZING ARENA WARRIORS...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 relative z-10">
              {/* ── Column 1: Algorithms Warfare ── */}
              {(activeCategory === "ALL" || activeCategory === "DSA") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col gap-6 ${activeCategory === "DSA" ? "lg:col-span-2 max-w-3xl mx-auto w-full" : ""}`}
                >
                  <div className="flex items-center justify-between border-b-4 border-red-500 pb-3">
                    <h2 className="text-2xl sm:text-4xl font-black text-red-500 uppercase tracking-tight flex items-center gap-3">
                      <span>⚔️ ALGORITHMS DIVISION</span>
                    </h2>
                    <span className="bg-red-500 text-white font-mono font-bold text-xs px-2.5 py-1 border border-slate-900">
                      DSA SCORES
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-5">
                    {dsaSorted.map((member, idx) => {
                      const rank = idx + 1;
                      const style = getPodiumStyle(rank, true);
                      const titleInfo = getRankTitle(rank);
                      const streakBadge = getStreakBadge(member.current_streak || 0);

                      // Threat Radar: Gap to overtake person ahead
                      const scoreAhead = idx > 0 ? (dsaSorted[idx - 1].monthly_dsa_score || 0) : null;
                      const xpGap = scoreAhead !== null ? Math.ceil(scoreAhead - (member.monthly_dsa_score || 0) + 1) : 0;

                      return (
                        <motion.div
                          key={member.member_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`p-4 sm:p-5 flex flex-col gap-3 transition-all rounded-none ${style.border} ${style.bg} ${style.textColor} ${style.shadow} ${
                            rank <= 3 ? "scale-[1.02] z-10" : "hover:-translate-y-1"
                          }`}
                        >
                          {/* Top Row: Rank title & Streak Badge */}
                          <div className="flex items-center justify-between border-b border-slate-900/20 pb-2">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 uppercase border border-slate-900 ${titleInfo.color}`}>
                              {titleInfo.title}
                            </span>
                            {streakBadge && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 uppercase border border-slate-900 ${streakBadge.style}`}>
                                {streakBadge.label} ({member.current_streak}d)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1 pr-2">
                              {/* Rank Badge */}
                              <div className={`px-2.5 py-1 text-xs sm:text-sm font-black uppercase font-mono border-2 border-slate-900 flex-shrink-0 ${style.badgeBg}`}>
                                {style.badgeIcon}
                              </div>

                              {/* Avatar / Initials */}
                              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-900 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-slate-900 text-base sm:text-xl">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  member.full_name?.charAt(0).toUpperCase()
                                )}
                              </div>

                              {/* Member Info */}
                              <div className="min-w-0 flex-1">
                                <div className="font-black text-base sm:text-2xl truncate uppercase tracking-tight">
                                  {member.full_name}
                                </div>
                                <div className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${style.subText}`}>
                                  SOLVED: <span className="font-black">{member.monthly_problems_solved || 0}</span>
                                </div>
                              </div>
                            </div>

                            {/* XP Score */}
                            <div className="text-right flex-shrink-0 pl-2">
                              <div className="text-2xl sm:text-5xl font-black font-mono leading-none">
                                {Math.floor(member.monthly_dsa_score || 0)}
                              </div>
                              <div className={`text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest mt-1 ${style.subText}`}>
                                DSA XP
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Threat Radar XP Gap Counter */}
                          {rank > 1 && xpGap > 0 && (
                            <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between text-[11px] font-mono font-bold">
                              <span className="opacity-80">THREAT RADAR:</span>
                              <span className="text-red-700 bg-red-100 px-2 py-0.5 border border-red-900">
                                +{xpGap} XP TO OVERTAKE #{rank - 1}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── Column 2: Development Conflict ── */}
              {(activeCategory === "ALL" || activeCategory === "DEV") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col gap-6 ${activeCategory === "DEV" ? "lg:col-span-2 max-w-3xl mx-auto w-full" : ""}`}
                >
                  <div className="flex items-center justify-between border-b-4 border-blue-600 pb-3">
                    <h2 className="text-2xl sm:text-4xl font-black text-blue-600 uppercase tracking-tight flex items-center gap-3">
                      <span>🛠️ DEVELOPMENT DIVISION</span>
                    </h2>
                    <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-1 border border-slate-900">
                      DEV SCORES
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-5">
                    {devSorted.map((member, idx) => {
                      const rank = idx + 1;
                      const style = getPodiumStyle(rank, false);
                      const titleInfo = getRankTitle(rank);
                      const streakBadge = getStreakBadge(member.current_streak || 0);

                      // Threat Radar: Gap to overtake person ahead
                      const scoreAhead = idx > 0 ? (devSorted[idx - 1].monthly_dev_score || 0) : null;
                      const xpGap = scoreAhead !== null ? Math.ceil(scoreAhead - (member.monthly_dev_score || 0) + 1) : 0;

                      return (
                        <motion.div
                          key={member.member_id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`p-4 sm:p-5 flex flex-col gap-3 transition-all rounded-none ${style.border} ${style.bg} ${style.textColor} ${style.shadow} ${
                            rank <= 3 ? "scale-[1.02] z-10" : "hover:-translate-y-1"
                          }`}
                        >
                          {/* Top Row: Rank title & Streak Badge */}
                          <div className="flex items-center justify-between border-b border-slate-900/20 pb-2">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 uppercase border border-slate-900 ${titleInfo.color}`}>
                              {titleInfo.title}
                            </span>
                            {streakBadge && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 uppercase border border-slate-900 ${streakBadge.style}`}>
                                {streakBadge.label} ({member.current_streak}d)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1 pr-2">
                              {/* Rank Badge */}
                              <div className={`px-2.5 py-1 text-xs sm:text-sm font-black uppercase font-mono border-2 border-slate-900 flex-shrink-0 ${style.badgeBg}`}>
                                {style.badgeIcon}
                              </div>

                              {/* Avatar / Initials */}
                              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-900 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-slate-900 text-base sm:text-xl">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  member.full_name?.charAt(0).toUpperCase()
                                )}
                              </div>

                              {/* Member Info */}
                              <div className="min-w-0 flex-1">
                                <div className="font-black text-base sm:text-2xl truncate uppercase tracking-tight">
                                  {member.full_name}
                                </div>
                                <div className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${style.subText}`}>
                                  COMMITS: <span className="font-black">{member.monthly_commits || 0}</span> | PRS: <span className="font-black">{member.monthly_prs || 0}</span>
                                </div>
                              </div>
                            </div>

                            {/* XP Score */}
                            <div className="text-right flex-shrink-0 pl-2">
                              <div className="text-2xl sm:text-5xl font-black font-mono leading-none">
                                {Math.floor(member.monthly_dev_score || 0)}
                              </div>
                              <div className={`text-[9px] sm:text-xs font-mono font-bold uppercase tracking-widest mt-1 ${style.subText}`}>
                                DEV XP
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Threat Radar XP Gap Counter */}
                          {rank > 1 && xpGap > 0 && (
                            <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between text-[11px] font-mono font-bold">
                              <span className="opacity-80">THREAT RADAR:</span>
                              <span className="text-blue-900 bg-blue-100 px-2 py-0.5 border border-blue-900">
                                +{xpGap} XP TO OVERTAKE #{rank - 1}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* ── RANK MECHANISM MODAL OVERLAY ── */}
      <AnimatePresence>
        {isRankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-4 sm:pt-10 pb-12 bg-slate-900/85 backdrop-blur-sm overflow-y-auto">
            {/* Persistent Floating Close Button Outside Modal Box */}
            <button
              onClick={() => setIsRankModalOpen(false)}
              className="fixed top-3 right-3 sm:top-6 sm:right-6 bg-red-600 hover:bg-slate-900 text-white font-mono font-black text-base sm:text-lg px-3 py-1.5 sm:px-4 sm:py-2 border-2 sm:border-4 border-slate-900 brutalist-shadow z-50 flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <span>✕</span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">CLOSE</span>
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white border-4 border-slate-900 brutalist-shadow max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-8 relative font-display text-slate-900 my-0 mt-2 sm:mt-4"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-4 mb-6 pr-12">
                <span className="text-3xl">⚔️</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">ARENA RANK MECHANISM</h2>
                  <p className="font-mono text-xs text-slate-600">HOW XP SCORES & COMPETITIVE RANKS ARE CALCULATED</p>
                </div>
              </div>

              {/* Modal Content Sections */}
              <div className="flex flex-col gap-6 text-sm">
                {/* 1. Score Formulas */}
                <div className="bg-slate-50 border-2 border-slate-900 p-4">
                  <h3 className="font-black text-base uppercase text-slate-900 mb-2 flex items-center gap-2">
                    <span>⚡ 1. DIVISION XP FORMULAS</span>
                  </h3>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="bg-red-100 border border-red-900 p-2.5 text-red-950">
                      <div className="font-bold">⚔️ ALGORITHMS (DSA) SCORE:</div>
                      <div>Total Problems Solved aggregated across all platform profiles (LeetCode + Codeforces + CodeChef + GFG + TUF) in the current month.</div>
                    </div>
                    <div className="bg-blue-100 border border-blue-900 p-2.5 text-blue-950">
                      <div className="font-bold">🛠️ DEVELOPMENT SCORE:</div>
                      <div>Aggregated monthly GitHub activity count: <span className="font-bold">Total Commits + Total Pull Requests</span>.</div>
                    </div>
                  </div>
                </div>

                {/* 2. Rank Titles */}
                <div className="bg-slate-50 border-2 border-slate-900 p-4">
                  <h3 className="font-black text-base uppercase text-slate-900 mb-2 flex items-center gap-2">
                    <span>👑 2. BATTLE RANK TITLES</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-black text-[#FACC15] p-2 border border-slate-900 font-bold">RANK #1: 👑 APEX LEGEND</div>
                    <div className="bg-slate-900 text-white p-2 border border-slate-900 font-bold">RANK #2: ⚔️ MASTER GLADIATOR</div>
                    <div className="bg-amber-900 text-amber-200 p-2 border border-slate-900 font-bold">RANK #3: 🥉 MASTER WARRIOR</div>
                    <div className="bg-[#0707f2] text-white p-2 border border-slate-900 font-bold">RANK #4-5: 💎 DIAMOND WARRIOR</div>
                    <div className="bg-slate-200 text-slate-800 p-2 border border-slate-900 font-bold col-span-1 sm:col-span-2">RANK #6+: ⚡ CONTENDER</div>
                  </div>
                </div>

                {/* 3. Threat Radar & Streaks */}
                <div className="bg-slate-50 border-2 border-slate-900 p-4">
                  <h3 className="font-black text-base uppercase text-slate-900 mb-2 flex items-center gap-2">
                    <span>📡 3. THREAT RADAR & STREAKS</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 font-mono text-xs text-slate-700">
                    <li><span className="font-bold text-slate-900">THREAT RADAR:</span> Shows the exact additional XP required to overtake the contender directly ahead of you.</li>
                    <li><span className="font-bold text-slate-900 font-mono">💥 RAMPAGE (14+ Days):</span> Active daily coding streak of 14 consecutive days.</li>
                    <li><span className="font-bold text-slate-900 font-mono">⚡ UNSTOPPABLE (7+ Days):</span> Active daily coding streak of 7 consecutive days.</li>
                    <li><span className="font-bold text-slate-900 font-mono">🔥 ON FIRE (3+ Days):</span> Active daily coding streak of 3 consecutive days.</li>
                  </ul>
                </div>

                {/* Monthly Reset Info */}
                <div className="bg-[#FACC15] border-2 border-slate-900 p-3 text-slate-900 font-mono text-xs font-bold flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <div>Arena scores reset automatically at the end of every calendar month. Champion titles are awarded based on final standings!</div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-end">
                <button
                  onClick={() => setIsRankModalOpen(false)}
                  className="bg-slate-900 text-white font-mono font-black text-xs px-6 py-2.5 border-2 border-slate-900 brutalist-shadow-sm hover:bg-[#0707f2] transition-colors cursor-pointer"
                >
                  GOT IT, WARRIOR!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
