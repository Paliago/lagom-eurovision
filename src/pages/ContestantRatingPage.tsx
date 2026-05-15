import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import {
  type Contestant,
  getContestantById,
  getContestantIndexById,
  getContestantsByYear,
} from "@/lib/contestants";
import { getAnimalEmojiForUser } from "@/lib/emoji";
import { useEurovisionUser } from "@/lib/hooks";
import { useHaptics } from "@/lib/haptics";
import { buildRoomPath, useAppYear } from "@/lib/year";
import { ChevronLeft, ChevronRight } from "lucide-react";

function deriveInitialScore(
  data:
    | {
        musicScore?: number | null;
        performanceScore?: number | null;
        vibesScore?: number | null;
      }
    | null
    | undefined,
  key: "musicScore" | "performanceScore" | "vibesScore",
): number | string {
  if (!data) return "";
  const val = data[key];
  return typeof val === "number" ? val : "";
}

const CATEGORY_META = {
  music: { label: "Music", icon: "🎵", color: "#f5b800" },
  performance: { label: "Performance", icon: "💃", color: "#ff2d78" },
  vibes: { label: "Vibes", icon: "🧑‍🎤", color: "#22d3ee" },
} as const;

const SWIPE_WINDOW_SIZE = 9;
const SWIPE_WINDOW_RADIUS = Math.floor(SWIPE_WINDOW_SIZE / 2);

function useCoarsePointer(): boolean {
  const [isCoarsePointer, setIsCoarsePointer] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = () => setIsCoarsePointer(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isCoarsePointer;
}

interface ContestantPanelProps {
  contestantId: string;
  roomName: string;
  year: number;
  isActive: boolean;
  onNavigate: (direction: "previous" | "next") => void;
}

function ContestantPanel({
  contestantId,
  roomName,
  year,
  isActive,
  onNavigate,
}: ContestantPanelProps) {
  const contestants = getContestantsByYear(year);
  const {
    userId,
    nickname: storedNickname,
    roomId: storedRoomId,
  } = useEurovisionUser();
  const currentNickname = storedNickname || "User";
  const { trigger } = useHaptics();

  const contestant: Contestant | null | undefined = getContestantById(
    contestantId,
    year,
  );
  const contestantOrder =
    (getContestantIndexById(contestantId, year) ?? -1) + 1;
  const totalContestants = contestants.length;

  const roomRatingsForContestant = useQuery(
    api.ratings.getRatingsForRoomAndContestant,
    storedRoomId
      ? { roomId: storedRoomId as Id<"rooms">, contestantId }
      : "skip",
  );

  const allGlobalRatingsForContestant = useQuery(
    api.ratings.getGlobalRatingsForContestant,
    { contestantId },
  );

  const roomUsers = useQuery(
    api.rooms.getRoomUsers,
    storedRoomId ? { roomId: storedRoomId as Id<"rooms"> } : "skip",
  );

  const currentUserRatingData = useQuery(
    api.ratings.getUserRatingForContestant,
    storedRoomId && userId
      ? { roomId: storedRoomId as Id<"rooms">, contestantId, userId }
      : "skip",
  );

  const [musicScore, setMusicScore] = useState<number | string>(() =>
    deriveInitialScore(currentUserRatingData, "musicScore"),
  );
  const [performanceScore, setPerformanceScore] = useState<number | string>(
    () => deriveInitialScore(currentUserRatingData, "performanceScore"),
  );
  const [vibesScore, setVibesScore] = useState<number | string>(() =>
    deriveInitialScore(currentUserRatingData, "vibesScore"),
  );

  const initializedContestantRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      contestantId !== initializedContestantRef.current &&
      currentUserRatingData !== undefined
    ) {
      setMusicScore(currentUserRatingData?.musicScore ?? "");
      setPerformanceScore(currentUserRatingData?.performanceScore ?? "");
      setVibesScore(currentUserRatingData?.vibesScore ?? "");
      initializedContestantRef.current = contestantId;
    }
  }, [contestantId, currentUserRatingData]);

  const roomAverages = useMemo(() => {
    if (!roomRatingsForContestant || roomRatingsForContestant.length === 0) {
      return {
        music: null,
        performance: null,
        vibes: null,
        total: null,
        count: 0,
      };
    }

    let sumMusic = 0;
    let countMusic = 0;
    let sumPerformance = 0;
    let countPerformance = 0;
    let sumVibes = 0;
    let countVibes = 0;
    const uniqueRaters = new Set<string>();

    for (const rating of roomRatingsForContestant) {
      uniqueRaters.add(rating.userId);
      if (typeof rating.musicScore === "number") {
        sumMusic += rating.musicScore;
        countMusic++;
      }
      if (typeof rating.performanceScore === "number") {
        sumPerformance += rating.performanceScore;
        countPerformance++;
      }
      if (typeof rating.vibesScore === "number") {
        sumVibes += rating.vibesScore;
        countVibes++;
      }
    }

    const avgMusic = countMusic > 0 ? sumMusic / countMusic : null;
    const avgPerformance =
      countPerformance > 0 ? sumPerformance / countPerformance : null;
    const avgVibes = countVibes > 0 ? sumVibes / countVibes : null;
    const validCategoryAverages = [avgMusic, avgPerformance, avgVibes].filter(
      (avg) => avg !== null,
    );
    const totalAvg =
      validCategoryAverages.length > 0
        ? validCategoryAverages.reduce((acc, curr) => acc + (curr ?? 0), 0) /
          validCategoryAverages.length
        : null;

    return {
      music: avgMusic !== null ? Number.parseFloat(avgMusic.toFixed(1)) : null,
      performance:
        avgPerformance !== null
          ? Number.parseFloat(avgPerformance.toFixed(1))
          : null,
      vibes: avgVibes !== null ? Number.parseFloat(avgVibes.toFixed(1)) : null,
      total: totalAvg !== null ? Number.parseFloat(totalAvg.toFixed(1)) : null,
      count: uniqueRaters.size,
    };
  }, [roomRatingsForContestant]);

  const globalAverages = useMemo(() => {
    if (!allGlobalRatingsForContestant) {
      return {
        music: null,
        performance: null,
        vibes: null,
        total: null,
        count: 0,
      };
    }
    return {
      music: allGlobalRatingsForContestant.avgMusic,
      performance: allGlobalRatingsForContestant.avgPerformance,
      vibes: allGlobalRatingsForContestant.avgVibes,
      total: allGlobalRatingsForContestant.totalAvg,
      count: allGlobalRatingsForContestant.numRaters,
    };
  }, [allGlobalRatingsForContestant]);

  const otherIndividualRatings = useMemo(() => {
    if (!roomUsers || !userId || !roomRatingsForContestant) return [];

    return roomUsers
      .filter((roomUser) => roomUser.userId !== userId)
      .map((roomUser) => {
        const existingRating = roomRatingsForContestant.find(
          (r) => r.userId === roomUser.userId,
        );
        const m = existingRating?.musicScore ?? null;
        const p = existingRating?.performanceScore ?? null;
        const v = existingRating?.vibesScore ?? null;
        const scoresProvided = [m, p, v].filter((s) => s !== null);
        const individualTotal =
          scoresProvided.length > 0
            ? scoresProvided.reduce((acc, curr) => acc + (curr ?? 0), 0) /
              scoresProvided.length
            : null;

        return {
          raterId: roomUser.userId,
          nickname: roomUser.nickname,
          music: m,
          performance: p,
          vibes: v,
          total:
            individualTotal !== null
              ? Number.parseFloat(individualTotal.toFixed(1))
              : null,
        };
      });
  }, [roomUsers, roomRatingsForContestant, userId]);

  const submitRatingMutation = useMutation(api.ratings.submitRating);

  const handleRatingChange = useCallback(
    async (category: "music" | "performance" | "vibes", value: string) => {
      if (!isActive) return;

      let scoreToSet: number | string = "";
      let scoreToSubmit: number | null = null;

      if (value === "") {
        scoreToSet = "";
      } else {
        const parsedScore = Number.parseInt(value, 10);
        if (Number.isNaN(parsedScore)) {
          scoreToSet = "";
        } else {
          const cappedScore = Math.max(1, Math.min(12, parsedScore));
          scoreToSet = cappedScore;
          scoreToSubmit = cappedScore;
        }
      }

      switch (category) {
        case "music":
          setMusicScore(scoreToSet);
          break;
        case "performance":
          setPerformanceScore(scoreToSet);
          break;
        case "vibes":
          setVibesScore(scoreToSet);
          break;
      }

      if (scoreToSubmit !== null && storedRoomId && userId) {
        trigger("selection");
        try {
          await submitRatingMutation({
            roomId: storedRoomId as Id<"rooms">,
            contestantId,
            userId,
            nickname: currentNickname,
            category,
            score: scoreToSubmit,
          });
        } catch (error) {
          console.error("Failed to submit rating:", error);
          trigger("error");
        }
      }
    },
    [
      contestantId,
      currentNickname,
      isActive,
      storedRoomId,
      submitRatingMutation,
      trigger,
      userId,
    ],
  );

  const currentUserTotal = useMemo(() => {
    const scores = [musicScore, performanceScore, vibesScore];
    const validScores = scores.filter((s) => typeof s === "number");
    if (validScores.length === 0) {
      if (musicScore === "" && performanceScore === "" && vibesScore === "") {
        return "—";
      }
      return "0";
    }
    return (
      validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length
    ).toFixed(1);
  }, [musicScore, performanceScore, vibesScore]);

  if (!contestant) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 font-medium mb-4">Contestant not found</p>
        <Link
          to={roomName ? buildRoomPath(year, roomName, "/contestants") : "/"}
          className="text-[#f5b800] font-semibold hover:underline"
        >
          Back to List
        </Link>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 font-medium mb-4">User not identified</p>
        <Link to="/" className="text-[#f5b800] font-semibold hover:underline">
          Re-join the room
        </Link>
      </div>
    );
  }

  if (!storedRoomId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 font-medium mb-4">Room ID not found</p>
        <Link to="/" className="text-[#f5b800] font-semibold hover:underline">
          Re-join the room
        </Link>
      </div>
    );
  }

  const getCurrentScore = (cat: "music" | "performance" | "vibes") => {
    switch (cat) {
      case "music":
        return musicScore;
      case "performance":
        return performanceScore;
      case "vibes":
        return vibesScore;
    }
  };

  return (
    <div className="min-h-full pt-5 flex flex-col">
      <div className="text-center pb-6 border-b border-white/[0.06]">
        <p className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest mb-4">
          {contestantOrder} of {totalContestants}
        </p>

        <div className="flex items-center justify-between mb-5 px-2">
          <button
            onClick={() => onNavigate("previous")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1a1a26] border border-white/[0.08] text-[#f5b800] transition-all duration-200 hover:bg-[#222233] active:scale-95"
            aria-label="Previous contestant"
          >
            <ChevronLeft className="size-5" />
          </button>

          <img
            src={contestant.flagUrl}
            alt={`Flag of ${contestant.country}`}
            className="w-32 h-20 object-cover rounded-xl shadow-lg border border-white/[0.08]"
          />

          <button
            onClick={() => onNavigate("next")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1a1a26] border border-white/[0.08] text-[#f5b800] transition-all duration-200 hover:bg-[#222233] active:scale-95"
            aria-label="Next contestant"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#f0f0f5] mb-1">
          {contestant.name}
        </h1>
        <p className="text-sm font-medium text-[#8a8a9a]">
          {contestant.song} · {contestant.country}
        </p>
      </div>

      <div className="py-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest">
            Scoreboard
          </h3>
          <div className="flex gap-3 text-[10px] font-semibold text-[#8a8a9a]">
            <span>🌍 {globalAverages.count}</span>
            <span>🏠 {roomAverages.count}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center">
          <div className="py-2" />
          <div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">
            🎵
          </div>
          <div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">
            💃
          </div>
          <div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">
            🧑‍🎤
          </div>
          <div className="text-[10px] font-bold text-[#f5b800] uppercase tracking-wider py-2">
            Total
          </div>

          <div className="text-[10px] font-semibold text-[#8a8a9a] py-2.5 flex items-center justify-center">
            Global
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5"
            style={{ color: CATEGORY_META.music.color }}
          >
            {globalAverages.music ?? "—"}
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5"
            style={{ color: CATEGORY_META.performance.color }}
          >
            {globalAverages.performance ?? "—"}
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5"
            style={{ color: CATEGORY_META.vibes.color }}
          >
            {globalAverages.vibes ?? "—"}
          </div>
          <div className="text-sm font-extrabold text-[#f5b800] tabular-nums py-2.5">
            {globalAverages.total ?? "—"}
          </div>

          <div className="text-[10px] font-semibold text-[#8a8a9a] py-2.5 flex items-center justify-center border-t border-white/[0.04]">
            Room
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]"
            style={{ color: CATEGORY_META.music.color }}
          >
            {roomAverages.music ?? "—"}
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]"
            style={{ color: CATEGORY_META.performance.color }}
          >
            {roomAverages.performance ?? "—"}
          </div>
          <div
            className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]"
            style={{ color: CATEGORY_META.vibes.color }}
          >
            {roomAverages.vibes ?? "—"}
          </div>
          <div className="text-sm font-extrabold text-[#f5b800] tabular-nums py-2.5 border-t border-white/[0.04]">
            {roomAverages.total ?? "—"}
          </div>
        </div>
      </div>

      {otherIndividualRatings.length > 0 && (
        <div className="py-6 border-b border-white/[0.06]">
          <h3 className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest mb-4">
            Room Ratings
          </h3>
          <div>
            {otherIndividualRatings.map((rater) => (
              <div
                key={rater.raterId}
                className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-b-0"
              >
                <span className="text-base shrink-0">
                  {getAnimalEmojiForUser(rater.raterId)}
                </span>
                <span className="text-sm font-semibold text-[#f0f0f5] w-20 shrink-0 truncate">
                  {rater.nickname}
                </span>
                <div className="flex-1 grid grid-cols-4 gap-1 text-center">
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: CATEGORY_META.music.color }}
                  >
                    {rater.music ?? "—"}
                  </span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: CATEGORY_META.performance.color }}
                  >
                    {rater.performance ?? "—"}
                  </span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: CATEGORY_META.vibes.color }}
                  >
                    {rater.vibes ?? "—"}
                  </span>
                  <span className="text-xs font-extrabold text-[#f5b800] tabular-nums">
                    {rater.total ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-8" />

      <div className="sticky bottom-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-[#f5b800]/20 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{getAnimalEmojiForUser(userId)}</span>
            <span className="text-[11px] font-bold text-[#f5b800] uppercase tracking-widest">
              Your Rating
            </span>
          </div>
          <span className="text-xs font-bold text-[#8a8a9a]">
            {currentNickname}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(["music", "performance", "vibes"] as const).map((cat) => (
            <div key={cat} className="flex flex-col items-center gap-1">
              <span className="text-base leading-none">
                {CATEGORY_META[cat].icon}
              </span>
              {isActive ? (
                <Input
                  type="number"
                  value={getCurrentScore(cat)}
                  onChange={(e) => {
                    void handleRatingChange(cat, e.target.value);
                  }}
                  min="1"
                  max="12"
                  placeholder="—"
                  className="h-11 text-center text-base font-extrabold bg-[#12121a] border-white/[0.08] focus-visible:border-[#f5b800]/40 focus-visible:ring-[#f5b800]/20 rounded-xl"
                  aria-label={`${CATEGORY_META[cat].label} score input`}
                />
              ) : (
                <div className="h-11 flex items-center justify-center w-full rounded-xl bg-[#12121a] border border-white/[0.08]">
                  <span className="text-base font-extrabold text-[#f0f0f5] tabular-nums">
                    {getCurrentScore(cat) || "—"}
                  </span>
                </div>
              )}
              <span className="text-[9px] font-bold text-[#8a8a9a] uppercase tracking-wider">
                {CATEGORY_META[cat].label}
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1">
            <span className="text-base leading-none">⭐</span>
            <div className="h-11 flex items-center justify-center w-full rounded-xl bg-[#f5b800]/10 border border-[#f5b800]/20">
              <span className="text-lg font-extrabold text-[#f5b800] tabular-nums">
                {currentUserTotal}
              </span>
            </div>
            <span className="text-[9px] font-bold text-[#8a8a9a] uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ContestantRatingPage: React.FC = () => {
  const { roomName, contestantId } = useParams<{
    roomName: string;
    contestantId: string;
  }>();
  const navigate = useNavigate();
  const year = useAppYear();
  const { trigger } = useHaptics();
  const isSwipeEnabled = useCoarsePointer();
  const contestants = getContestantsByYear(year);
  const routeContestantIndex = contestantId
    ? getContestantIndexById(contestantId, year)
    : null;
  const [activeContestantIndex, setActiveContestantIndex] = useState(
    routeContestantIndex ?? 0,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStateRef = useRef<{
    touchId: number;
    startX: number;
    startY: number;
    lastX: number;
    startTranslateX: number;
    isDragging: boolean;
    isHorizontal: boolean | null;
  } | null>(null);
  const pendingContestantIndexRef = useRef<number | null>(null);
  const snapCompletionTimeoutRef = useRef<number | null>(null);

  const activeContestant = contestants[activeContestantIndex] ?? null;
  const activeContestantId = activeContestant?.id ?? contestantId ?? null;
  const previousContestantId =
    activeContestantIndex > 0
      ? (contestants[activeContestantIndex - 1]?.id ?? null)
      : null;
  const nextContestantId =
    activeContestantIndex < contestants.length - 1
      ? (contestants[activeContestantIndex + 1]?.id ?? null)
      : null;
  const windowStartIndex = Math.max(
    0,
    Math.min(
      activeContestantIndex - SWIPE_WINDOW_RADIUS,
      Math.max(0, contestants.length - SWIPE_WINDOW_SIZE),
    ),
  );
  const visibleContestants = contestants.slice(
    windowStartIndex,
    windowStartIndex + SWIPE_WINDOW_SIZE,
  );
  const activePanelIndex = activeContestantIndex - windowStartIndex;

  useEffect(() => {
    if (routeContestantIndex == null) return;
    setActiveContestantIndex(routeContestantIndex);
  }, [routeContestantIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const width = container.offsetWidth;
      setContainerWidth(width);
      setTranslateX(-width * activePanelIndex);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [activeContestantIndex, activePanelIndex, windowStartIndex]);

  useLayoutEffect(() => {
    setIsAnimating(false);
    setTranslateX(-containerWidth * activePanelIndex);
    pendingContestantIndexRef.current = null;
    if (snapCompletionTimeoutRef.current !== null) {
      window.clearTimeout(snapCompletionTimeoutRef.current);
      snapCompletionTimeoutRef.current = null;
    }
  }, [
    activeContestantIndex,
    activePanelIndex,
    containerWidth,
    windowStartIndex,
  ]);

  const navigateToContestant = useCallback(
    (newContestantId: string | null) => {
      if (!newContestantId || !roomName) return;
      void navigate(
        buildRoomPath(year, roomName, `/contestant/${newContestantId}`),
        { replace: true },
      );
    },
    [navigate, roomName, year],
  );

  const getCurrentTrackTranslateX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return translateX;

    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === "none") return translateX;

    const matrix = new DOMMatrixReadOnly(transform);
    return matrix.m41;
  }, [translateX]);

  const completePendingSnap = useCallback(() => {
    if (snapCompletionTimeoutRef.current !== null) {
      window.clearTimeout(snapCompletionTimeoutRef.current);
      snapCompletionTimeoutRef.current = null;
    }

    setIsAnimating(false);
    const pendingContestantIndex = pendingContestantIndexRef.current;
    pendingContestantIndexRef.current = null;

    if (pendingContestantIndex !== null) {
      const pendingContestant = contestants[pendingContestantIndex];
      if (!pendingContestant) return;

      setActiveContestantIndex(pendingContestantIndex);
      navigateToContestant(pendingContestant.id);
    }
  }, [contestants, navigateToContestant]);

  const snapToPanel = useCallback(
    (targetPanelIndex: number) => {
      if (containerWidth === 0) return;
      if (snapCompletionTimeoutRef.current !== null) {
        window.clearTimeout(snapCompletionTimeoutRef.current);
        snapCompletionTimeoutRef.current = null;
      }

      const clampedPanelIndex = Math.max(
        0,
        Math.min(visibleContestants.length - 1, targetPanelIndex),
      );
      const targetContestantIndex = windowStartIndex + clampedPanelIndex;
      pendingContestantIndexRef.current =
        targetContestantIndex === activeContestantIndex
          ? null
          : targetContestantIndex;
      const targetTranslateX = -containerWidth * clampedPanelIndex;

      setIsAnimating(true);
      setTranslateX(targetTranslateX);
      snapCompletionTimeoutRef.current = window.setTimeout(
        completePendingSnap,
        320,
      );
    },
    [
      activeContestantIndex,
      completePendingSnap,
      containerWidth,
      visibleContestants.length,
      windowStartIndex,
    ],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length !== 1) return;

      const target = event.target as HTMLElement;
      if (target.closest("button, input, textarea, select, a")) return;
      const touch = event.touches[0];

      const currentTranslateX = getCurrentTrackTranslateX();
      if (snapCompletionTimeoutRef.current !== null) {
        window.clearTimeout(snapCompletionTimeoutRef.current);
        snapCompletionTimeoutRef.current = null;
      }
      setIsAnimating(false);
      setTranslateX(currentTranslateX);
      pendingContestantIndexRef.current = null;

      dragStateRef.current = {
        touchId: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        startTranslateX: currentTranslateX,
        isDragging: false,
        isHorizontal: null,
      };
    },
    [getCurrentTrackTranslateX],
  );

  const getActiveTouch = useCallback(
    (touches: React.TouchList, touchId: number) => {
      for (let index = 0; index < touches.length; index++) {
        const touch = touches.item(index);
        if (touch?.identifier === touchId) return touch;
      }
      return null;
    },
    [],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      const touch = getActiveTouch(event.touches, dragState.touchId);
      if (!touch) return;

      const deltaX = touch.clientX - dragState.startX;
      const deltaY = touch.clientY - dragState.startY;

      if (dragState.isHorizontal === null) {
        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
        dragState.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (!dragState.isHorizontal) return;

      event.preventDefault();
      dragState.isDragging = true;
      dragState.lastX = touch.clientX;
      const minTranslateX = -(visibleContestants.length - 1) * containerWidth;
      const maxTranslateX = 0;
      const nextTranslateX = Math.max(
        minTranslateX,
        Math.min(maxTranslateX, dragState.startTranslateX + deltaX),
      );
      setTranslateX(nextTranslateX);
    },
    [containerWidth, getActiveTouch, visibleContestants.length],
  );

  const finishTouchGesture = useCallback(() => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    dragStateRef.current = null;
    if (!dragState.isDragging || !dragState.isHorizontal) {
      snapToPanel(activePanelIndex);
      return;
    }

    const deltaX = dragState.lastX - dragState.startX;
    const threshold = Math.min(120, containerWidth * 0.22);
    const startPanelIndex = Math.round(
      -dragState.startTranslateX / containerWidth,
    );
    if (deltaX > threshold) {
      trigger("light");
      snapToPanel(startPanelIndex - 1);
    } else if (deltaX < -threshold) {
      trigger("light");
      snapToPanel(startPanelIndex + 1);
    } else {
      snapToPanel(Math.round(-translateX / containerWidth));
    }
  }, [activePanelIndex, containerWidth, snapToPanel, translateX, trigger]);

  const cancelTouchGesture = useCallback(() => {
    dragStateRef.current = null;
    pendingContestantIndexRef.current = null;
    snapToPanel(activePanelIndex);
  }, [activePanelIndex, snapToPanel]);

  const handleTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== trackRef.current) return;
      completePendingSnap();
    },
    [completePendingSnap],
  );

  const handlePanelNavigate = useCallback(
    (direction: "previous" | "next") => {
      if (direction === "previous" && !previousContestantId) return;
      if (direction === "next" && !nextContestantId) return;

      trigger("light");
      snapToPanel(
        direction === "previous" ? activePanelIndex - 1 : activePanelIndex + 1,
      );
    },
    [
      activePanelIndex,
      nextContestantId,
      previousContestantId,
      snapToPanel,
      trigger,
    ],
  );

  if (!activeContestantId || !roomName) {
    return (
      <div className="py-5 text-center">
        <p className="text-red-400 font-medium mb-4">Contestant not found</p>
        <Link to="/" className="text-[#f5b800] font-semibold hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  if (!isSwipeEnabled) {
    return (
      <div className="py-5">
        <ContestantPanel
          contestantId={activeContestantId}
          roomName={roomName}
          year={year}
          isActive
          onNavigate={(direction) => {
            const targetContestantId =
              direction === "previous"
                ? previousContestantId
                : nextContestantId;
            if (!targetContestantId) return;
            trigger("light");
            void navigate(
              buildRoomPath(
                year,
                roomName,
                `/contestant/${targetContestantId}`,
              ),
            );
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={finishTouchGesture}
      onTouchCancel={cancelTouchGesture}
      className="-mx-4 h-full overflow-hidden overscroll-x-contain"
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        className="flex h-full will-change-transform"
        style={{
          width: containerWidth * visibleContestants.length,
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: isAnimating
            ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
      >
        {visibleContestants.map((contestant, panelIndex) => (
          <div
            key={contestant.id}
            className="h-full shrink-0 overflow-y-auto px-4"
            style={{ width: containerWidth }}
          >
            <ContestantPanel
              contestantId={contestant.id}
              roomName={roomName}
              year={year}
              isActive={panelIndex === activePanelIndex}
              onNavigate={handlePanelNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContestantRatingPage;
