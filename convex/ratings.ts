import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const ratingDocValidator = v.object({
	_id: v.id("ratings"),
	_creationTime: v.number(),
	roomId: v.id("rooms"),
	contestantId: v.string(),
	userId: v.string(),
	nickname: v.string(),
	musicScore: v.optional(v.number()),
	performanceScore: v.optional(v.number()),
	vibesScore: v.optional(v.number()),
});

const overviewResultValidator = v.object({
	contestantId: v.string(),
	avgMusic: v.union(v.number(), v.null()),
	avgPerformance: v.union(v.number(), v.null()),
	avgVibes: v.union(v.number(), v.null()),
	totalAvg: v.union(v.number(), v.null()),
	numRaters: v.number(),
});

/**
 * Mutation to submit or update a user's rating for a specific category of a contestant in a room.
 * It performs an "upsert": updates if a rating by the user for the contestant/category exists, otherwise inserts.
 */
export const submitRating = mutation({
	args: {
		roomId: v.id("rooms"),
		contestantId: v.string(),
		userId: v.string(),
		nickname: v.string(),
		category: v.union(
			v.literal("music"),
			v.literal("performance"),
			v.literal("vibes"),
		),
		score: v.number(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const existingRating = await ctx.db
			.query("ratings")
			.withIndex("by_roomId_contestantId_userId", (q) =>
				q
					.eq("roomId", args.roomId)
					.eq("contestantId", args.contestantId)
					.eq("userId", args.userId),
			)
			.unique();

		if (existingRating) {
			const newScores = { ...existingRating };
			if (args.category === "music") newScores.musicScore = args.score;
			if (args.category === "performance")
				newScores.performanceScore = args.score;
			if (args.category === "vibes") newScores.vibesScore = args.score;

			await ctx.db.patch(existingRating._id, {
				musicScore: newScores.musicScore,
				performanceScore: newScores.performanceScore,
				vibesScore: newScores.vibesScore,
				nickname: args.nickname,
			});
		} else {
			type NewRatingData = {
				roomId: typeof args.roomId;
				contestantId: string;
				userId: string;
				nickname: string;
				musicScore?: number;
				performanceScore?: number;
				vibesScore?: number;
			};

			const newRatingFields: NewRatingData = {
				roomId: args.roomId,
				contestantId: args.contestantId,
				userId: args.userId,
				nickname: args.nickname,
			};
			if (args.category === "music") newRatingFields.musicScore = args.score;
			else if (args.category === "performance")
				newRatingFields.performanceScore = args.score;
			else if (args.category === "vibes")
				newRatingFields.vibesScore = args.score;

			await ctx.db.insert("ratings", newRatingFields);
		}
		return null;
	},
});

/**
 * Query to fetch all ratings for a specific contestant within a specific room.
 */
export const getRatingsForRoomAndContestant = query({
	args: {
		roomId: v.id("rooms"),
		contestantId: v.string(),
	},
	returns: v.array(ratingDocValidator),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ratings")
			.withIndex("by_roomId_contestantId", (q) =>
				q.eq("roomId", args.roomId).eq("contestantId", args.contestantId),
			)
			.collect();
	},
});

export const getUserRatingForContestant = query({
	args: {
		roomId: v.id("rooms"),
		contestantId: v.string(),
		userId: v.string(),
	},
	returns: v.union(v.null(), ratingDocValidator),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("ratings")
			.withIndex("by_roomId_contestantId_userId", (q) =>
				q
					.eq("roomId", args.roomId)
					.eq("contestantId", args.contestantId)
					.eq("userId", args.userId),
			)
			.unique();
	},
});

/**
 * Query to fetch all ratings for a room and aggregate them per contestant.
 * Calculates average scores for music, performance, vibes, and an overall total average.
 */
export const getOverviewRatingsForRoom = query({
	args: { roomId: v.id("rooms") },
	returns: v.array(overviewResultValidator),
	handler: async (ctx, args) => {
		const allRatingsInRoom = await ctx.db
			.query("ratings")
			.withIndex("by_roomId_contestantId", (q) => q.eq("roomId", args.roomId))
			.collect();

		if (allRatingsInRoom.length === 0) {
			return [];
		}

		// Aggregate ratings by contestantId in a single pass
		const ratingsByContestant: Record<
			string,
			{
				musicScores: number[];
				performanceScores: number[];
				vibesScores: number[];
				uniqueUserIds: Set<string>;
			}
		> = {};

		for (const rating of allRatingsInRoom) {
			if (!ratingsByContestant[rating.contestantId]) {
				ratingsByContestant[rating.contestantId] = {
					musicScores: [],
					performanceScores: [],
					vibesScores: [],
					uniqueUserIds: new Set(),
				};
			}

			const contestantData = ratingsByContestant[rating.contestantId];
			contestantData.uniqueUserIds.add(rating.userId);

			if (rating.musicScore !== undefined)
				contestantData.musicScores.push(rating.musicScore);
			if (rating.performanceScore !== undefined)
				contestantData.performanceScores.push(rating.performanceScore);
			if (rating.vibesScore !== undefined)
				contestantData.vibesScores.push(rating.vibesScore);
		}

		// Calculate averages
		const overviewResults = Object.entries(ratingsByContestant).map(
			([contestantId, data]) => {
				const numRaters = data.uniqueUserIds.size;

				const avgMusic =
					numRaters > 0 && data.musicScores.length > 0
						? data.musicScores.reduce((a, b) => a + b, 0) /
							data.musicScores.length
						: null;
				const avgPerformance =
					numRaters > 0 && data.performanceScores.length > 0
						? data.performanceScores.reduce((a, b) => a + b, 0) /
							data.performanceScores.length
						: null;
				const avgVibes =
					numRaters > 0 && data.vibesScores.length > 0
						? data.vibesScores.reduce((a, b) => a + b, 0) /
							data.vibesScores.length
						: null;

				let overallTotalAvg = null;
				const validAverages = [avgMusic, avgPerformance, avgVibes].filter(
					(score) => score !== null,
				);
				if (validAverages.length > 0) {
					overallTotalAvg =
						validAverages.reduce((a, b) => a + b, 0) / validAverages.length;
				}

				return {
					contestantId,
					avgMusic:
						avgMusic !== null
							? Number.parseFloat(avgMusic.toFixed(1))
							: null,
					avgPerformance:
						avgPerformance !== null
							? Number.parseFloat(avgPerformance.toFixed(1))
							: null,
					avgVibes:
						avgVibes !== null
							? Number.parseFloat(avgVibes.toFixed(1))
							: null,
					totalAvg:
						overallTotalAvg !== null
							? Number.parseFloat(overallTotalAvg.toFixed(1))
							: null,
					numRaters,
				};
			},
		);

		return overviewResults;
	},
});

/**
 * Query to fetch all unique users in a room who have submitted at least one rating
 * for a specific year. This filters out users who only rated contestants from other years.
 */
export const getRoomUsersForYear = query({
	args: {
		roomId: v.id("rooms"),
		year: v.number(),
	},
	returns: v.array(
		v.object({ nickname: v.string(), userId: v.string() }),
	),
	handler: async (ctx, args) => {
		const allRatingsInRoom = await ctx.db
			.query("ratings")
			.withIndex("by_roomId_contestantId", (q) => q.eq("roomId", args.roomId))
			.collect();

		const prefix = `esc${args.year}_`;
		const yearRatings = allRatingsInRoom.filter((r) =>
			r.contestantId.startsWith(prefix),
		);

		const uniqueUsers = new Map<string, string>();
		for (const rating of yearRatings) {
			uniqueUsers.set(rating.userId, rating.nickname);
		}

		return Array.from(uniqueUsers.entries()).map(([userId, nickname]) => ({
			userId,
			nickname,
		}));
	},
});

/**
 * Query to fetch all ratings for a specific contestant across all rooms and aggregate them.
 */
export const getGlobalRatingsForContestant = query({
	args: { contestantId: v.string() },
	returns: v.object({
		contestantId: v.string(),
		avgMusic: v.union(v.number(), v.null()),
		avgPerformance: v.union(v.number(), v.null()),
		avgVibes: v.union(v.number(), v.null()),
		totalAvg: v.union(v.number(), v.null()),
		numRaters: v.number(),
	}),
	handler: async (ctx, args) => {
		const allRatingsForContestant = await ctx.db
			.query("ratings")
			.withIndex("by_contestantId", (q) =>
				q.eq("contestantId", args.contestantId),
			)
			.collect();

		if (allRatingsForContestant.length === 0) {
			return {
				contestantId: args.contestantId,
				avgMusic: null,
				avgPerformance: null,
				avgVibes: null,
				totalAvg: null,
				numRaters: 0,
			};
		}

		const musicScores: number[] = [];
		const performanceScores: number[] = [];
		const vibesScores: number[] = [];
		const uniqueUserIds = new Set<string>();

		for (const rating of allRatingsForContestant) {
			uniqueUserIds.add(rating.userId);
			if (rating.musicScore !== undefined) {
				musicScores.push(rating.musicScore);
			}
			if (rating.performanceScore !== undefined) {
				performanceScores.push(rating.performanceScore);
			}
			if (rating.vibesScore !== undefined) {
				vibesScores.push(rating.vibesScore);
			}
		}

		const numRaters = uniqueUserIds.size;

		const avgMusic =
			musicScores.length > 0
				? musicScores.reduce((a, b) => a + b, 0) / musicScores.length
				: null;
		const avgPerformance =
			performanceScores.length > 0
				? performanceScores.reduce((a, b) => a + b, 0) /
					performanceScores.length
				: null;
		const avgVibes =
			vibesScores.length > 0
				? vibesScores.reduce((a, b) => a + b, 0) / vibesScores.length
				: null;

		let overallTotalAvg = null;
		const validAverages = [avgMusic, avgPerformance, avgVibes].filter(
			(score) => score !== null,
		);

		if (validAverages.length > 0) {
			overallTotalAvg =
				validAverages.reduce((a, b) => a + b, 0) / validAverages.length;
		}

		return {
			contestantId: args.contestantId,
			avgMusic:
				avgMusic !== null ? Number.parseFloat(avgMusic.toFixed(1)) : null,
			avgPerformance:
				avgPerformance !== null
					? Number.parseFloat(avgPerformance.toFixed(1))
					: null,
			avgVibes:
				avgVibes !== null
					? Number.parseFloat(avgVibes.toFixed(1))
					: null,
			totalAvg:
				overallTotalAvg !== null
					? Number.parseFloat(overallTotalAvg.toFixed(1))
					: null,
			numRaters,
		};
	},
});

/**
 * Query to fetch all ratings for all contestants across all rooms and aggregate them.
 */
export const getGlobalOverviewRatings = query({
	args: {},
	returns: v.array(
		v.object({
			contestantId: v.string(),
			avgMusic: v.union(v.number(), v.null()),
			avgPerformance: v.union(v.number(), v.null()),
			avgVibes: v.union(v.number(), v.null()),
			totalAvg: v.union(v.number(), v.null()),
			numRaters: v.number(),
		}),
	),
	handler: async (ctx) => {
		const allRatings = await ctx.db.query("ratings").collect();

		if (allRatings.length === 0) {
			return [];
		}

		// Aggregate ratings by contestantId
		const ratingsByContestant: Record<
			string,
			{
				musicScores: number[];
				performanceScores: number[];
				vibesScores: number[];
				uniqueUserIds: Set<string>;
			}
		> = {};

		for (const rating of allRatings) {
			if (!ratingsByContestant[rating.contestantId]) {
				ratingsByContestant[rating.contestantId] = {
					musicScores: [],
					performanceScores: [],
					vibesScores: [],
					uniqueUserIds: new Set<string>(),
				};
			}
			const contestantData = ratingsByContestant[rating.contestantId];

			contestantData.uniqueUserIds.add(rating.userId);

			if (rating.musicScore !== undefined) {
				contestantData.musicScores.push(rating.musicScore);
			}
			if (rating.performanceScore !== undefined) {
				contestantData.performanceScores.push(rating.performanceScore);
			}
			if (rating.vibesScore !== undefined) {
				contestantData.vibesScores.push(rating.vibesScore);
			}
		}

		// Calculate averages for each contestant
		const globalOverviewResults = Object.entries(ratingsByContestant).map(
			([contestantId, data]) => {
				const numRaters = data.uniqueUserIds.size;

				const avgMusic =
					data.musicScores.length > 0
						? data.musicScores.reduce((a, b) => a + b, 0) /
							data.musicScores.length
						: null;
				const avgPerformance =
					data.performanceScores.length > 0
						? data.performanceScores.reduce((a, b) => a + b, 0) /
							data.performanceScores.length
						: null;
				const avgVibes =
					data.vibesScores.length > 0
						? data.vibesScores.reduce((a, b) => a + b, 0) /
							data.vibesScores.length
						: null;

				let overallTotalAvg = null;
				const validAverages = [avgMusic, avgPerformance, avgVibes].filter(
					(score) => score !== null,
				);

				if (validAverages.length > 0) {
					overallTotalAvg =
						validAverages.reduce((a, b) => a + (b ?? 0), 0) /
						validAverages.length;
				}

				return {
					contestantId,
					avgMusic:
						avgMusic !== null
							? Number.parseFloat(avgMusic.toFixed(1))
							: null,
					avgPerformance:
						avgPerformance !== null
							? Number.parseFloat(avgPerformance.toFixed(1))
							: null,
					avgVibes:
						avgVibes !== null
							? Number.parseFloat(avgVibes.toFixed(1))
							: null,
					totalAvg:
						overallTotalAvg !== null
							? Number.parseFloat(overallTotalAvg.toFixed(1))
							: null,
					numRaters,
				};
			},
		);

		return globalOverviewResults;
	},
});
