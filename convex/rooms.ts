import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const joinOrCreateRoom = mutation({
	args: {
		roomName: v.string(),
		nickname: v.string(),
		userId: v.string(),
	},
	returns: v.object({
		roomId: v.id("rooms"),
		isNewRoom: v.boolean(),
		userId: v.string(),
	}),
	handler: async (ctx, args) => {
		const roomName = args.roomName.trim();
		const normalizedName = roomName.toLowerCase();

		const existingRoom = await ctx.db
			.query("rooms")
			.withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalizedName))
			.unique();

		if (existingRoom) {
			let userFound = false;
			const updatedUsers = existingRoom.users.map((user) => {
				if (user.userId === args.userId) {
					userFound = true;
					return { ...user, nickname: args.nickname };
				}
				return user;
			});

			if (userFound) {
				await ctx.db.patch(existingRoom._id, { users: updatedUsers });
			} else {
				await ctx.db.patch(existingRoom._id, {
					users: [
						...existingRoom.users,
						{ nickname: args.nickname, userId: args.userId },
					],
				});
			}

			return {
				roomId: existingRoom._id,
				isNewRoom: false,
				userId: args.userId,
			};
		}

		const newRoomId = await ctx.db.insert("rooms", {
			name: roomName,
			normalizedName,
			users: [{ nickname: args.nickname, userId: args.userId }],
		});
		return { roomId: newRoomId, isNewRoom: true, userId: args.userId };
	},
});

export const getRoomUsers = query({
	args: { roomId: v.id("rooms") },
	returns: v.array(
		v.object({ nickname: v.string(), userId: v.string() }),
	),
	handler: async (ctx, args) => {
		const room = await ctx.db.get(args.roomId);
		if (!room) {
			return [];
		}
		return room.users;
	},
});

export const findUserInRoomByNickname = query({
	args: {
		roomName: v.string(),
		nickname: v.string(),
	},
	returns: v.union(
		v.null(),
		v.object({ userId: v.string(), roomId: v.id("rooms") }),
	),
	handler: async (ctx, args) => {
		const roomName = args.roomName.trim();
		const normalizedName = roomName.toLowerCase();

		const room = await ctx.db
			.query("rooms")
			.withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalizedName))
			.unique();

		if (room) {
			const user = room.users.find((u) => u.nickname === args.nickname);
			if (user) {
				return { userId: user.userId, roomId: room._id };
			}
		}
		return null;
	},
});
