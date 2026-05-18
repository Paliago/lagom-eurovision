import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	rooms: defineTable({
		name: v.string(),
		normalizedName: v.optional(v.string()),
		users: v.array(v.object({ nickname: v.string(), userId: v.string() })),
	})
		.index("by_name", ["name"])
		.index("by_normalizedName", ["normalizedName"]),

	ratings: defineTable({
		roomId: v.id("rooms"),
		contestantId: v.string(),
		userId: v.string(),
		nickname: v.string(),
		musicScore: v.optional(v.number()),
		performanceScore: v.optional(v.number()),
		vibesScore: v.optional(v.number()),
	})
		.index("by_roomId_contestantId_userId", [
			"roomId",
			"contestantId",
			"userId",
		])
		.index("by_roomId_contestantId", ["roomId", "contestantId"])
		.index("by_contestantId", ["contestantId"]),
});
