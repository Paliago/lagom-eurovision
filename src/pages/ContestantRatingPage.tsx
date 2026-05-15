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
import { getBackgroundColorForRater } from "@/lib/colors";
import { useEurovisionUser } from "@/lib/hooks";
import { useHaptics } from "@/lib/haptics";
import { ChevronLeft, ChevronRight, TrendingUp, Users, Globe } from "lucide-react";

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

	const ScoreBlock = ({
		label,
		value,
		color,
	}: {
		label: string;
		value: string | number | null;
		color?: string;
	}) => (
		<div className="flex flex-col items-center gap-1">
			<span className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider">{label}</span>
			<span
				className="text-lg font-extrabold tabular-nums"
				style={{ color: color ?? "#f0f0f5" }}
			>
				{value ?? "—"}
			</span>
		</div>
	);

	return (
		<div className="space-y-5 pb-4">
			{/* Contestant header card */}
			<div className="bg-[#1a1a26] rounded-2xl border border-white/[0.08] p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
				<p className="text-[11px] font-bold text-[#8a8a9a] uppercase tracking-widest mb-3">
					{contestantOrder} of {totalContestants}
				</p>

				<div className="flex items-center justify-between mb-4">
					<button
						onClick={handlePrevious}
						className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#12121a] border border-white/[0.08] text-[#f5b800] transition-all duration-200 hover:bg-[#222233] active:scale-95"
						aria-label="Previous contestant"
					>
						<ChevronLeft className="size-5" />
					</button>

					{contestant.flagUrl ? (
					<img
						src={contestant.flagUrl}
						alt={`Flag of ${contestant.country}`}
						className="w-28 h-16 object-cover rounded-lg shadow-lg border border-white/[0.08]"
					/>
					) : (
						<div className="w-28 h-16 bg-[#12121a] flex items-center justify-center text-[#8a8a9a] rounded-lg border border-white/[0.08]">
							FLAG
						</div>
					)}

					<button
						onClick={handleNext}
						className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#12121a] border border-white/[0.08] text-[#f5b800] transition-all duration-200 hover:bg-[#222233] active:scale-95"
						aria-label="Next contestant"
					>
						<ChevronRight className="size-5" />
					</button>
				</div>

				<h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f5] mb-1">
					{contestant.name}
				</h2>
				<p className="text-sm font-medium text-[#8a8a9a]">
					{contestant.song} · {contestant.country}
				</p>
			</div>

			{/* Global averages */}
			<div className="bg-[#1a1a26] rounded-2xl border border-white/[0.08] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
				<div className="flex items-center gap-2 mb-4">
					<Globe className="size-4 text-[#8a8a9a]" />
					<h3 className="text-xs font-bold text-[#8a8a9a] uppercase tracking-widest">
						Global Average ({globalAverages.count} ratings)
					</h3>
				</div>
				<div className="grid grid-cols-4 gap-2">
					<ScoreBlock label="Music" value={globalAverages.music} color={CATEGORY_META.music.color} />
					<ScoreBlock label="Perf" value={globalAverages.performance} color={CATEGORY_META.performance.color} />
					<ScoreBlock label="Vibes" value={globalAverages.vibes} color={CATEGORY_META.vibes.color} />
					<ScoreBlock label="Total" value={globalAverages.total} color="#f5b800" />
				</div>
			</div>

			{/* Room averages */}
			<div className="bg-[#1a1a26] rounded-2xl border border-white/[0.08] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
				<div className="flex items-center gap-2 mb-4">
					<Users className="size-4 text-[#8a8a9a]" />
					<h3 className="text-xs font-bold text-[#8a8a9a] uppercase tracking-widest">
						Room Average ({roomAverages.count} ratings)
					</h3>
				</div>
				<div className="grid grid-cols-4 gap-2">
					<ScoreBlock label="Music" value={roomAverages.music} color={CATEGORY_META.music.color} />
					<ScoreBlock label="Perf" value={roomAverages.performance} color={CATEGORY_META.performance.color} />
					<ScoreBlock label="Vibes" value={roomAverages.vibes} color={CATEGORY_META.vibes.color} />
					<ScoreBlock label="Total" value={roomAverages.total} color="#f5b800" />
				</div>
			</div>

			{/* Your rating */}
			<div className="bg-[#1a1a26] rounded-2xl border border-[#f5b800]/20 p-5 shadow-[0_0_40px_rgba(245,184,0,0.08)]">
				<div className="flex items-center gap-2 mb-4">
					<span className="text-lg">{userId ? getAnimalEmojiForUser(userId) : "🐾"}</span>
					<h3 className="text-xs font-bold text-[#f5b800] uppercase tracking-widest">
						Your Rating
					</h3>
				</div>

				<div className="grid grid-cols-4 gap-3">
					{( ["music", "performance", "vibes"] as const ).map((cat) => (
						<div key={cat} className="flex flex-col items-center gap-1.5">
							<span className="text-lg">{CATEGORY_META[cat].icon}</span>
							<Input
								type="number"
								value={cat === "music" ? musicScore : cat === "performance" ? performanceScore : vibesScore}
								onChange={(e) => {
									void handleRatingChange(cat, e.target.value);
								}}
								min="1"
								max="12"
								placeholder="—"
								className="h-12 text-center text-lg font-extrabold bg-[#12121a] border-white/[0.08] focus-visible:border-[#f5b800]/40 focus-visible:ring-[#f5b800]/20 rounded-xl"
								aria-label={`${CATEGORY_META[cat].label} score input`}
							/>
							<span className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider">
								{CATEGORY_META[cat].label}
							</span>
						</div>
					))}
					<div className="flex flex-col items-center gap-1.5">
						<TrendingUp className="size-5 text-[#8a8a9a]" />
						<div className="h-12 flex items-center justify-center w-full rounded-xl bg-[#f5b800]/10 border border-[#f5b800]/20">
							<span className="text-xl font-extrabold text-[#f5b800] tabular-nums">
								{currentUserTotal}
							</span>
						</div>
						<span className="text-[10px] font-bold text-[#8a8a9a] uppercase tracking-wider">Total</span>
					</div>
				</div>
			</div>

			{/* Other raters */}
			{otherIndividualRatings.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-xs font-bold text-[#8a8a9a] uppercase tracking-widest px-1">
						Room Ratings
					</h3>
					{otherIndividualRatings.map((rater) => (
						<div
							key={rater.raterId}
							className={`rounded-2xl border border-white/[0.06] p-4 ${getBackgroundColorForRater(
								rater.raterId,
							)}`}
						>
							<div className="flex items-center gap-2 mb-3">
								<span className="text-base">{getAnimalEmojiForUser(rater.raterId)}</span>
								<span className="text-sm font-bold text-[#f0f0f5]">{rater.nickname}</span>
							</div>
							<div className="grid grid-cols-4 gap-2">
								<ScoreBlock label="Music" value={rater.music} />
								<ScoreBlock label="Perf" value={rater.performance} />
								<ScoreBlock label="Vibes" value={rater.vibes} />
								<ScoreBlock label="Total" value={rater.total} color="#f5b800" />
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ContestantRatingPage;
