import { describe, expect, it } from "vitest";
import { DEFAULT_YEAR } from "../contestants";
import { buildRoomPath } from "../year";

describe("buildRoomPath", () => {
	it("omits year prefix for default year", () => {
		expect(buildRoomPath(DEFAULT_YEAR, "test-room", "/contestants")).toBe(
			"/room/test-room/contestants",
		);
	});

	it("includes year prefix for non-default year", () => {
		expect(buildRoomPath(2025, "test-room", "/contestants")).toBe(
			"/2025/room/test-room/contestants",
		);
	});

	it("handles empty suffix", () => {
		expect(buildRoomPath(DEFAULT_YEAR, "test-room", "")).toBe(
			"/room/test-room",
		);
	});
});
