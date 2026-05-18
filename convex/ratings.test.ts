import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("ratings", () => {
	it("submitRating creates a new rating", async () => {
		const t = convexTest(schema, modules);

		const room = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "test-room",
			nickname: "Alice",
			userId: "user-1",
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-1",
			nickname: "Alice",
			category: "music",
			score: 8,
		});

		const userRating = await t.query(
			api.ratings.getUserRatingForContestant,
			{
				roomId: room.roomId,
				contestantId: "esc2026_1",
				userId: "user-1",
			},
		);

		expect(userRating).not.toBeNull();
		expect(userRating?.musicScore).toBe(8);
		expect(userRating?.performanceScore).toBeUndefined();
	});

	it("submitRating updates an existing rating", async () => {
		const t = convexTest(schema, modules);

		const room = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "test-room",
			nickname: "Alice",
			userId: "user-1",
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-1",
			nickname: "Alice",
			category: "music",
			score: 5,
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-1",
			nickname: "Alice",
			category: "music",
			score: 9,
		});

		const userRating = await t.query(
			api.ratings.getUserRatingForContestant,
			{
				roomId: room.roomId,
				contestantId: "esc2026_1",
				userId: "user-1",
			},
		);

		expect(userRating?.musicScore).toBe(9);
	});

	it("getOverviewRatingsForRoom aggregates averages correctly", async () => {
		const t = convexTest(schema, modules);

		const room = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "agg-room",
			nickname: "Alice",
			userId: "user-1",
		});

		await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "agg-room",
			nickname: "Bob",
			userId: "user-2",
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-1",
			nickname: "Alice",
			category: "music",
			score: 6,
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-1",
			nickname: "Alice",
			category: "performance",
			score: 8,
		});

		await t.mutation(api.ratings.submitRating, {
			roomId: room.roomId,
			contestantId: "esc2026_1",
			userId: "user-2",
			nickname: "Bob",
			category: "music",
			score: 10,
		});

		const overview = await t.query(api.ratings.getOverviewRatingsForRoom, {
			roomId: room.roomId,
		});

		expect(overview).toHaveLength(1);
		const agg = overview[0];
		expect(agg.contestantId).toBe("esc2026_1");
		expect(agg.avgMusic).toBe(8); // (6 + 10) / 2 = 8
		expect(agg.avgPerformance).toBe(8); // only one rating
		expect(agg.avgVibes).toBeNull();
		expect(agg.numRaters).toBe(2);
		expect(agg.totalAvg).toBe(8); // (8 + 8) / 2 = 8
	});

	it("getOverviewRatingsForRoom returns empty array for new room", async () => {
		const t = convexTest(schema, modules);

		const room = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "empty-room",
			nickname: "Alice",
			userId: "user-1",
		});

		const overview = await t.query(api.ratings.getOverviewRatingsForRoom, {
			roomId: room.roomId,
		});

		expect(overview).toEqual([]);
	});
});
