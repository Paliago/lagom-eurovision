import { describe, expect, it } from "vitest";
import { getBackgroundColorForRater } from "../colors";

describe("getBackgroundColorForRater", () => {
	it("is deterministic for the same raterId", () => {
		const id = "rater-123";
		expect(getBackgroundColorForRater(id)).toBe(getBackgroundColorForRater(id));
	});

	it("returns a valid tailwind bg class", () => {
		const color = getBackgroundColorForRater("any-id");
		expect(color).toMatch(/^bg-\[#[0-9a-fA-F]{6}\]$/);
	});

	it("distributes across the color array", () => {
		const colors = new Set<string>();
		for (let i = 0; i < 100; i++) {
			colors.add(getBackgroundColorForRater(`rater-${i}`));
		}
		expect(colors.size).toBeGreaterThan(1);
	});
});
