import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("rooms", () => {
	it("joinOrCreateRoom creates a new room", async () => {
		const t = convexTest(schema, modules);
		const result = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "New Room",
			nickname: "Alice",
			userId: "user-1",
		});

		expect(result.isNewRoom).toBe(true);
		expect(result.userId).toBe("user-1");

		const users = await t.query(api.rooms.getRoomUsers, {
			roomId: result.roomId,
		});
		expect(users).toHaveLength(1);
		expect(users[0].nickname).toBe("Alice");
		expect(users[0].userId).toBe("user-1");
	});

	it("joinOrCreateRoom normalizes room name", async () => {
		const t = convexTest(schema, modules);
		const result1 = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "Mixed Case",
			nickname: "Alice",
			userId: "user-1",
		});

		const result2 = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "mixed case",
			nickname: "Bob",
			userId: "user-2",
		});

		expect(result1.roomId).toBe(result2.roomId);
		expect(result2.isNewRoom).toBe(false);

		const users = await t.query(api.rooms.getRoomUsers, {
			roomId: result1.roomId,
		});
		expect(users).toHaveLength(2);
	});

	it("joinOrCreateRoom trims room name", async () => {
		const t = convexTest(schema, modules);
		const result1 = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "  spaced  ",
			nickname: "Alice",
			userId: "user-1",
		});

		const result2 = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "spaced",
			nickname: "Bob",
			userId: "user-2",
		});

		expect(result1.roomId).toBe(result2.roomId);
	});

	it("joinOrCreateRoom updates nickname for existing user", async () => {
		const t = convexTest(schema, modules);
		const room = await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "test",
			nickname: "Alice",
			userId: "user-1",
		});

		await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "test",
			nickname: "Alicia",
			userId: "user-1",
		});

		const users = await t.query(api.rooms.getRoomUsers, {
			roomId: room.roomId,
		});
		expect(users).toHaveLength(1);
		expect(users[0].nickname).toBe("Alicia");
	});

	it("findUserInRoomByNickname finds existing user", async () => {
		const t = convexTest(schema, modules);
		await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "lookup",
			nickname: "Alice",
			userId: "user-1",
		});

		const found = await t.query(api.rooms.findUserInRoomByNickname, {
			roomName: "lookup",
			nickname: "Alice",
		});

		expect(found).not.toBeNull();
		expect(found?.userId).toBe("user-1");
	});

	it("findUserInRoomByNickname returns null for missing user", async () => {
		const t = convexTest(schema, modules);
		await t.mutation(api.rooms.joinOrCreateRoom, {
			roomName: "lookup",
			nickname: "Alice",
			userId: "user-1",
		});

		const found = await t.query(api.rooms.findUserInRoomByNickname, {
			roomName: "lookup",
			nickname: "Bob",
		});

		expect(found).toBeNull();
	});
});
