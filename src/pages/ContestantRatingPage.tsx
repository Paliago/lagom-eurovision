import type React from "react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
} from "@/components/ui/card";
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

// Derive initial score from rating data, treating null/undefined as empty string
function deriveInitialScore(
	data: { musicScore?: number | null; performanceScore?: number | null; vibesScore?: number | null } | null | undefined,
	key: "musicScore" | "performanceScore" | "vibesScore",
): number | string {
	if (!data) return "";
	const val = data[key];
	return typeof val === "number" ? val : "";
}

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

	// Use key-based reset: state resets automatically when contestantId changes
	const [musicScore, setMusicScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "musicScore"),
	);
	const [performanceScore, setPerformanceScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "performanceScore"),
	);
	const [vibesScore, setVibesScore] = useState<number | string>(() =>
		deriveInitialScore(currentUserRatingData, "vibesScore"),
	);

	// Minimal one-time sync: only initialize from server data when contestant changes
	// and currentUserRatingData has finished loading. This avoids overwriting user edits
	// on re-renders or data refetches.
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
		if (!roomRatingsForContestant) {
			return {
				music: null,
				performance: null,
				vibes: null,
				total: null,
				count: 0,
			};
		}
		if (roomRatingsForContestant.length === 0) {
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

				let individualTotal = null;
				const scoresProvided = [m, p, v].filter((s) => s !== null);
				if (scoresProvided.length > 0) {
					individualTotal =
						scoresProvided.reduce((acc, curr) => acc + (curr ?? 0), 0) /
						scoresProvided.length;
				}

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

			if (scoreToSubmit !== null && storedRoomId && contestantId && userId) {
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
					alert(
						`Failed to submit rating: ${
							error instanceof Error ? error.message : "Unknown error"
						}`,
					);
				}
			}
		},
		[storedRoomId, contestantId, userId, submitRatingMutation, currentNickname],
	);

	const currentUserTotal = useMemo(() => {
		const scores = [musicScore, performanceScore, vibesScore];
		const validScores = scores.filter((s) => typeof s === "number");

		if (validScores.length === 0) {
			if (musicScore === "" && performanceScore === "" && vibesScore === "")
				return "-";
			return "0";
		}
		return (
			validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length
		).toFixed(1);
	}, [musicScore, performanceScore, vibesScore]);

	const navigateToContestant = useCallback(
		(newContestantId: string | null) => {
			if (newContestantId && roomName) {
				setMusicScore("");
				setPerformanceScore("");
				setVibesScore("");
				void navigate(
					buildRoomPath(
						year,
						roomName,
						`/contestant/${newContestantId}`,
					),
				);
			}
		},
		[navigate, roomName, year],
	);

	const handleNext = useCallback(
		() => navigateToContestant(contestantId ? getNextContestantId(contestantId, year) : null),
		[navigateToContestant, contestantId, year],
	);
	const handlePrevious = useCallback(
		() => navigateToContestant(contestantId ? getPreviousContestantId(contestantId, year) : null),
		[navigateToContestant, contestantId, year],
	);

	if (!contestant || !contestantId) {
		return (
			<div className="p-4 text-red-500">
				Contestant not found.{" "}
				<Button variant="link" asChild>
					<Link
						to={
							roomName
								? buildRoomPath(year, roomName, "/contestants")
								: "/"
						}
					>
						Back to List
					</Link>
				</Button>
			</div>
		);
	}
	if (!userId) {
		return (
			<div className="p-4 text-red-500">
				User not identified. Please{" "}
				<Button variant="link" asChild>
					<Link to="/">re-join the room</Link>
				</Button>
				.
			</div>
		);
	}
	if (!storedRoomId) {
		return (
			<div className="p-4 text-red-500">
				Room ID not found. Please{" "}
				<Button variant="link" asChild>
					<Link to="/">re-join the room</Link>
				</Button>
				.
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center">
			<Card className="w-full max-w-md bg-white/90 shadow-xl py-4">
				<CardHeader className="px-4">
					<div className="text-center">
						<p className="text-sm text-purple-600 font-medium mb-2">
							{contestantOrder} of {totalContestants}
						</p>

						<div className="flex justify-between items-center mb-2">
							<Button
								onClick={handlePrevious}
								variant="ghost"
								size="icon"
								className="text-yellow-400 hover:text-yellow-500 touch-manipulation"
							>
								<span className="text-3xl">👈</span>
							</Button>

							{contestant.flagUrl ? (
								<img
									src={contestant.flagUrl}
									alt={`Flag of ${contestant.country}`}
									className="w-24 h-16 object-contain rounded border border-gray-200"
								/>
							) : (
								<div className="w-24 h-16 bg-gray-300 flex items-center justify-center text-gray-500 rounded">
									FLAG
								</div>
							)}
							<Button
								onClick={handleNext}
								variant="ghost"
								size="icon"
								className="text-yellow-400 hover:text-yellow-500 touch-manipulation"
							>
								<span className="text-3xl">👉</span>
							</Button>
						</div>
					</div>
					<div className="text-center">
						<CardTitle className="text-2xl font-bold text-gray-800">
							{contestant.name}
						</CardTitle>
						<CardDescription className="text-lg text-gray-600">
							{contestant.song} ({contestant.country})
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-4 space-y-3">
					<div className="p-4 bg-purple-400 rounded-lg shadow space-y-2">
						<div className="flex justify-evenly items-center space-x-8">
							<div className="text-center text-gray-700">
								<span>🎵</span>
							</div>
							<div className="text-center text-gray-700">
								<span>💃</span>
							</div>
							<div className="text-center text-gray-700">
								<span>🧑‍🎤</span>
							</div>
							<div className="text-center text-gray-700">
								<span>🟰</span>
							</div>
						</div>
						<div className="flex items-center space-x-2 mb-2">
							<span className="text-xl">🌍</span>
							<h4 className="text-md font-semibold text-white">
								Global Average ({globalAverages.count} ratings)
							</h4>
						</div>
						<div className="grid grid-cols-4 gap-2 text-sm items-center">
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{globalAverages.music ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{globalAverages.performance ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{globalAverages.vibes ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-blue-100 rounded text-blue-700">
								{globalAverages.total ?? "-"}
							</div>
						</div>

						<div className="flex items-center space-x-2 mt-3 mb-2">
							<span className="text-xl">🏠</span>
							<h4 className="text-md font-semibold text-white">
								Room Average ({roomAverages.count} ratings)
							</h4>
						</div>
						<div className="grid grid-cols-4 gap-2 text-sm items-center">
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{roomAverages.music ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{roomAverages.performance ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
								<span className="font-medium text-gray-700">
									{roomAverages.vibes ?? "-"}
								</span>
							</div>
							<div className="flex flex-col items-center p-1 bg-blue-100 rounded text-blue-700">
								{roomAverages.total ?? "-"}
							</div>
						</div>
					</div>

					<div className="p-4 bg-blue-400 rounded-lg shadow space-y-2">
						<div className="flex items-center space-x-2 mb-2">
							<span className="text-xl">
								{userId ? getAnimalEmojiForUser(userId) : "🐾"}
							</span>
							<h4 className="text-md font-semibold text-white">
								{currentNickname}
							</h4>
						</div>
						<div className="flex justify-evenly items-center space-x-8 mb-2">
							<div className="text-center text-gray-700">
								<span>🎵</span>
							</div>
							<div className="text-center text-gray-700">
								<span>💃</span>
							</div>
							<div className="text-center text-gray-700">
								<span>🧑‍🎤</span>
							</div>
							<div className="text-center text-gray-700">
								<span>🟰</span>
							</div>
						</div>
						<div className="grid grid-cols-4 gap-2 items-center">
							<Input
								type="number"
								value={musicScore}
								onChange={(e) => {
									void handleRatingChange("music", e.target.value);
								}}
								min="1"
								max="12"
								placeholder="-"
								className="text-center bg-white rounded"
								aria-label="Music score input"
							/>
							<Input
								type="number"
								value={performanceScore}
								onChange={(e) => {
									void handleRatingChange("performance", e.target.value);
								}}
								min="1"
								max="12"
								placeholder="-"
								className="text-center bg-white rounded"
								aria-label="Performance score input"
							/>
							<Input
								type="number"
								value={vibesScore}
								onChange={(e) => {
									void handleRatingChange("vibes", e.target.value);
								}}
								min="1"
								max="12"
								placeholder="-"
								className="text-center bg-white rounded"
								aria-label="Vibes score input"
							/>
							<div className="text-center font-bold text-white text-lg bg-blue-500/50 py-1.5 rounded">
								{currentUserTotal}
							</div>
						</div>
					</div>

					{otherIndividualRatings.map((rater) => (
						<div
							key={rater.raterId}
							className={`p-4 ${getBackgroundColorForRater(
								rater.raterId,
							)} rounded-lg shadow space-y-2`}
						>
							<div className="flex items-center space-x-2 mb-2">
								<span className="text-xl">
									{getAnimalEmojiForUser(rater.raterId)}
								</span>
								<h4 className="text-md font-semibold text-white">
									{rater.nickname}
								</h4>
							</div>
							<div className="grid grid-cols-4 gap-2 text-sm items-center">
								<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
									<span className="font-medium text-gray-700">
										{rater.music ?? "-"}
									</span>
								</div>
								<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
									<span className="font-medium text-gray-700">
										{rater.performance ?? "-"}
									</span>
								</div>
								<div className="flex flex-col items-center p-1 bg-gray-200 rounded">
									<span className="font-medium text-gray-700">
										{rater.vibes ?? "-"}
									</span>
								</div>
								<div className="flex flex-col items-center p-1 bg-blue-100 rounded text-blue-700">
									{rater.total ?? "-"}
								</div>
							</div>
						</div>
					))}
				</CardContent>

				<div className="px-4">
					<Button
						onClick={() =>
							void navigate(
								roomName
									? buildRoomPath(year, roomName, "/contestants")
									: "/",
							)
						}
						className="w-full bg-purple-500 hover:bg-purple-600 text-white touch-manipulation"
					>
						Back to List
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default ContestantRatingPage;
