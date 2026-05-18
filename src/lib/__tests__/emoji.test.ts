import { describe, expect, it } from "vitest";
import { getAnimalEmojiForUser } from "../emoji";

describe("getAnimalEmojiForUser", () => {
	it("is deterministic for the same userId", () => {
		const id = "user-123";
		expect(getAnimalEmojiForUser(id)).toBe(getAnimalEmojiForUser(id));
	});

	it("returns a valid emoji", () => {
		const emoji = getAnimalEmojiForUser("any-id");
		expect(emoji).toMatch(/^[\u{1F400}-\u{1F4FF}\u{1F980}-\u{1F9FF}]$/u);
	});

	it("handles empty string", () => {
		expect(getAnimalEmojiForUser("")).toBeDefined();
	});

	it("distributes across the emoji array", () => {
		const emojis = new Set<string>();
		for (let i = 0; i < 100; i++) {
			emojis.add(getAnimalEmojiForUser(`user-${i}`));
		}
		expect(emojis.size).toBeGreaterThan(1);
	});
});
