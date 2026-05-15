import type React from "react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import {
	type Contestant,
	getContestantById,
	getContestantsByYear,
	getNextContestantId,
	getPreviousContestantId,
	getContestantIndexById,
} from "@/lib/contestants";
import { useAppYear, buildRoomPath } from "@/lib/year";
import { getAnimalEmojiForUser } from "@/lib/emoji";
import { useEurovisionUser } from "@/lib/hooks";
import { useHaptics } from "@/lib/haptics";
import { ChevronLeft, ChevronRight } from "lucide-react";

function deriveInitialScore(
	data: { musicScore?: number | null; performanceScore?: number | null; vibesScore?: number | null } | null | undefined,
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

const ContestantRatingPage: React.FC = () => {
	const { roomName, contestantId } = useParams<{
		roomName: string;
		contestantId: string;
	}>();
	const navigate = useNavigate();
	const year = useAppYear();
	const contestants = getContestantsByYear(year);
	const { userId, nickname: storedNickname, roomId: storedRoomId } = useEurovisionUser();
	const currentNickname = storedNickname || "User";
	const { trigger } = useHaptics();

	const contestant: Contestant | null | undefined = contestantId
		? getContestantById(contestantId, year)
		: null;

	const contestantOrder = contestantId
		? (getContestantIndexById(contestantId, year) ?? -1) + 1
		: 0;
	const totalContestants = contestants.length;

	const roomRatingsForContestant = useQuery(
		api.ratings.getRatingsForRoomAndContestant,
		storedRoomId && contestantId
			? { roomId: storedRoomId as Id<"rooms">, contestantId: contestantId }
			: "skip",
	);

	const allGlobalRatingsForContestant = useQuery(
		api.ratings.getGlobalRatingsForContestant,
		contestantId ? { contestantId: contestantId } : "skip",
	);

	const roomUsers = useQuery(
		api.rooms.getRoomUsers,
		storedRoomId ? { roomId: storedRoomId as Id<"rooms"> } : "skip",
	);

	const currentUserRatingData = useQuery(
		api.ratings.getUserRatingForContestant,
		storedRoomId && contestantId && userId
			? { roomId: storedRoomId as Id<"rooms">, contestantId: contestantId, userId: userId }
			: "skip",
	);

	const [musicScore, setMusicScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "musicScore"),
	);
	const [performanceScore, setPerformanceScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "performanceScore"),
	);
	const [vibesScore, setVibesScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "vibesScore"),
	);

	const initializedContestantRef = useRef<string | null>(null);
	useEffect(() => {
		if (
			contestantId &&
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
			return { music: null, performance: null, vibes: null, total: null, count: 0 };
		}

		let sumMusic = 0, countMusic = 0;
		let sumPerformance = 0, countPerformance = 0;
		let sumVibes = 0, countVibes = 0;
		const uniqueRaters = new Set<string>();

		for (const rating of roomRatingsForContestant) {
			uniqueRaters.add(rating.userId);
			if (typeof rating.musicScore === "number") { sumMusic += rating.musicScore; countMusic++; }
			if (typeof rating.performanceScore === "number") { sumPerformance += rating.performanceScore; countPerformance++; }
			if (typeof rating.vibesScore === "number") { sumVibes += rating.vibesScore; countVibes++; }
		}

		const avgMusic = countMusic > 0 ? sumMusic / countMusic : null;
		const avgPerformance = countPerformance > 0 ? sumPerformance / countPerformance : null;
		const avgVibes = countVibes > 0 ? sumVibes / countVibes : null;
		const validCategoryAverages = [avgMusic, avgPerformance, avgVibes].filter((avg) => avg !== null);
		const totalAvg = validCategoryAverages.length > 0
			? validCategoryAverages.reduce((acc, curr) => acc + (curr ?? 0), 0) / validCategoryAverages.length
			: null;

		return {
			music: avgMusic !== null ? Number.parseFloat(avgMusic.toFixed(1)) : null,
			performance: avgPerformance !== null ? Number.parseFloat(avgPerformance.toFixed(1)) : null,
			vibes: avgVibes !== null ? Number.parseFloat(avgVibes.toFixed(1)) : null,
			total: totalAvg !== null ? Number.parseFloat(totalAvg.toFixed(1)) : null,
			count: uniqueRaters.size,
		};
	}, [roomRatingsForContestant]);

	const globalAverages = useMemo(() => {
		if (!allGlobalRatingsForContestant) {
			return { music: null, performance: null, vibes: null, total: null, count: 0 };
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
				const individualTotal = scoresProvided.length > 0
					? scoresProvided.reduce((acc, curr) => acc + (curr ?? 0), 0) / scoresProvided.length
					: null;

				return {
					raterId: roomUser.userId,
					nickname: roomUser.nickname,
					music: m,
					performance: p,
					vibes: v,
					total: individualTotal !== null ? Number.parseFloat(individualTotal.toFixed(1)) : null,
				};
			});
	}, [roomUsers, roomRatingsForContestant, userId]);

	const submitRatingMutation = useMutation(api.ratings.submitRating);

	const handleRatingChange = useCallback(
		async (category: "music" | "performance" | "vibes", value: string) => {
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
				case "music": setMusicScore(scoreToSet); break;
				case "performance": setPerformanceScore(scoreToSet); break;
				case "vibes": setVibesScore(scoreToSet); break;
			}

			if (scoreToSubmit !== null && storedRoomId && contestantId && userId) {
				trigger("selection");
				try {
					await submitRatingMutation({
						roomId: storedRoomId as Id<"rooms">,
						contestantId,
						userId,
						nickname: currentNickname,
						category: category,
						score: scoreToSubmit,
					});
				} catch (error) {
					console.error("Failed to submit rating:", error);
					trigger("error");
				}
			}
		},
		[storedRoomId, contestantId, userId, submitRatingMutation, currentNickname, trigger],
	);

	const currentUserTotal = useMemo(() => {
		const scores = [musicScore, performanceScore, vibesScore];
		const validScores = scores.filter((s) => typeof s === "number");
		if (validScores.length === 0) {
			if (musicScore === "" && performanceScore === "" && vibesScore === "") return "—";
			return "0";
		}
		return (validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length).toFixed(1);
	}, [musicScore, performanceScore, vibesScore]);

	const navigateToContestant = useCallback(
		(newContestantId: string | null) => {
			if (newContestantId && roomName) {
				setMusicScore("");
				setPerformanceScore("");
				setVibesScore("");
				void navigate(buildRoomPath(year, roomName, `/contestant/${newContestantId}`));
			}
		},
		[navigate, roomName, year],
	);

	const handleNext = useCallback(() => {
		trigger("light");
		navigateToContestant(contestantId ? getNextContestantId(contestantId, year) : null);
	}, [navigateToContestant, contestantId, year, trigger]);

	const handlePrevious = useCallback(() => {
		trigger("light");
		navigateToContestant(contestantId ? getPreviousContestantId(contestantId, year) : null);
	}, [navigateToContestant, contestantId, year, trigger]);

	if (!contestant || !contestantId) {
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

	return (
		<div className="pb-4">
			{/* Hero — no card, clean centered */}
			<div className="text-center pt-2 pb-6 border-b border-white/[0.06]">
				<p className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest mb-4">
					{contestantOrder} of {totalContestants}
				</p>

				<div className="flex items-center justify-between mb-5 px-2">
					<button
						onClick={handlePrevious}
						className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1a1a26] border border-white/[0.08] text-[#f5b800] transition-all duration-200 hover:bg-[#222233] active:scale-95"
						aria-label="Previous contestant"
					>
						<ChevronLeft className="size-5" />
					</button>

					{contestant.flagUrl ? (
						<img
							src={contestant.flagUrl}
							alt={`Flag of ${contestant.country}`}
							className="w-32 h-20 object-cover rounded-xl shadow-lg border border-white/[0.08]"
						/>
					) : (
						<div className="w-32 h-20 bg-[#1a1a26] flex items-center justify-center text-[#8a8a9a] rounded-xl border border-white/[0.08]">
							FLAG
						</div>
					)}

					<button
						onClick={handleNext}
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

			{/* Scoreboard — unified table-like grid, no cards */}
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
					<div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2" />
					<div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">🎵</div>
					<div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">💃</div>
					<div className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider py-2">🧑‍🎤</div>
					<div className="text-[10px] font-bold text-[#f5b800] uppercase tracking-wider py-2">Total</div>

					<div className="text-[10px] font-semibold text-[#8a8a9a] py-2.5 flex items-center justify-center">Global</div>
					<div className="text-sm font-bold tabular-nums py-2.5" style={{ color: CATEGORY_META.music.color }}>{globalAverages.music ?? "—"}</div>
					<div className="text-sm font-bold tabular-nums py-2.5" style={{ color: CATEGORY_META.performance.color }}>{globalAverages.performance ?? "—"}</div>
					<div className="text-sm font-bold tabular-nums py-2.5" style={{ color: CATEGORY_META.vibes.color }}>{globalAverages.vibes ?? "—"}</div>
					<div className="text-sm font-extrabold text-[#f5b800] tabular-nums py-2.5">{globalAverages.total ?? "—"}</div>

					<div className="text-[10px] font-semibold text-[#8a8a9a] py-2.5 flex items-center justify-center border-t border-white/[0.04]">Room</div>
					<div className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]" style={{ color: CATEGORY_META.music.color }}>{roomAverages.music ?? "—"}</div>
					<div className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]" style={{ color: CATEGORY_META.performance.color }}>{roomAverages.performance ?? "—"}</div>
					<div className="text-sm font-bold tabular-nums py-2.5 border-t border-white/[0.04]" style={{ color: CATEGORY_META.vibes.color }}>{roomAverages.vibes ?? "—"}</div>
					<div className="text-sm font-extrabold text-[#f5b800] tabular-nums py-2.5 border-t border-white/[0.04]">{roomAverages.total ?? "—"}</div>
				</div>
			</div>

			{/* Room Ratings — compact rows, no cards */}
			{otherIndividualRatings.length > 0 && (
				<div className="py-6 border-b border-white/[0.06]">
					<h3 className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest mb-4">
						Room Ratings
					</h3>
					<div className="space-y-0">
						{otherIndividualRatings.map((rater) => (
							<div
								key={rater.raterId}
								className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-b-0"
							>
								<span className="text-base shrink-0">{getAnimalEmojiForUser(rater.raterId)}</span>
								<span className="text-sm font-semibold text-[#f0f0f5] w-20 shrink-0 truncate">{rater.nickname}</span>
								<div className="flex-1 grid grid-cols-4 gap-1 text-center">
									<span className="text-xs font-bold tabular-nums" style={{ color: CATEGORY_META.music.color }}>{rater.music ?? "—"}</span>
									<span className="text-xs font-bold tabular-nums" style={{ color: CATEGORY_META.performance.color }}>{rater.performance ?? "—"}</span>
									<span className="text-xs font-bold tabular-nums" style={{ color: CATEGORY_META.vibes.color }}>{rater.vibes ?? "—"}</span>
									<span className="text-xs font-extrabold text-[#f5b800] tabular-nums">{rater.total ?? "—"}</span>
								</div>
							</div>
						))}
						</div>
					</div>
				)}

			{/* Spacer so sticky bottom rating doesn't cover last content */}
			<div className="h-28" />

			{/* Your Rating — sticky bottom dock, no card borders */}
			<div className="fixed bottom-14 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-[#f5b800]/20 pb-[env(safe-area-inset-bottom)]">
				<div className="max-w-lg mx-auto px-4 py-3">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-1.5">
							<span className="text-sm">{userId ? getAnimalEmojiForUser(userId) : "🐾"}</span>
							<span className="text-[11px] font-bold text-[#f5b800] uppercase tracking-widest">
								Your Rating
							</span>
						</div>
						<span className="text-xs font-bold text-[#8a8a9a]">{currentNickname}</span>
					</div>

					<div className="grid grid-cols-4 gap-2">
						{( ["music", "performance", "vibes"] as const ).map((cat) => (
							<div key={cat} className="flex flex-col items-center gap-1">
								<span className="text-base leading-none">{CATEGORY_META[cat].icon}</span>
								<Input
									type="number"
									value={cat === "music" ? musicScore : cat === "performance" ? performanceScore : vibesScore}
									onChange={(e) => {
										void handleRatingChange(cat, e.target.value);
									}}
									min="1"
									max="12"
									placeholder="—"
									className="h-11 text-center text-base font-extrabold bg-[#12121a] border-white/[0.08] focus-visible:border-[#f5b800]/40 focus-visible:ring-[#f5b800]/20 rounded-xl"
									aria-label={`${CATEGORY_META[cat].label} score input`}
								/>
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
							<span className="text-[9px] font-bold text-[#8a8a9a] uppercase tracking-wider">Total</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContestantRatingPage;
