import { describe, expect, it } from "vitest";
import {
	contestants2025,
	contestants2026,
	getContestantsByYear,
	getContestantById,
	getContestantIndexById,
	getNextContestantId,
	getPreviousContestantId,
	DEFAULT_YEAR,
	VALID_YEARS,
} from "../contestants";

describe("getContestantsByYear", () => {
	it("returns contestants for a valid year", () => {
		expect(getContestantsByYear(2025)).toBe(contestants2025);
		expect(getContestantsByYear(2026)).toBe(contestants2026);
	});

	it("falls back to default year for invalid year", () => {
		expect(getContestantsByYear(1999)).toBe(contestants2026);
	});
});

describe("getContestantById", () => {
	it("finds a contestant in the specified year", () => {
		const c = getContestantById("esc2025_1", 2025);
		expect(c).toBeDefined();
		expect(c?.country).toBe("Norway");
	});

	it("falls back to default year when not found", () => {
		const c = getContestantById("esc2026_1", 2025);
		expect(c).toBeDefined();
		expect(c?.country).toBe("Denmark");
	});

	it("falls back to default year when year is invalid", () => {
		const c = getContestantById("esc2026_1", 1999);
		expect(c).toBeDefined();
		expect(c?.country).toBe("Denmark");
	});

	it("returns undefined for unknown id in default year", () => {
		expect(getContestantById("unknown", DEFAULT_YEAR)).toBeUndefined();
	});
});

describe("getContestantIndexById", () => {
	it("returns correct index", () => {
		expect(getContestantIndexById("esc2025_1", 2025)).toBe(0);
		expect(getContestantIndexById("esc2025_2", 2025)).toBe(1);
	});

	it("returns undefined for unknown id", () => {
		expect(getContestantIndexById("unknown", 2025)).toBeUndefined();
	});
});

describe("getNextContestantId", () => {
	it("returns next id in array", () => {
		expect(getNextContestantId("esc2025_1", 2025)).toBe("esc2025_2");
	});

	it("wraps around at end of array", () => {
		const lastId = contestants2025[contestants2025.length - 1].id;
		expect(getNextContestantId(lastId, 2025)).toBe("esc2025_1");
	});

	it("returns null for unknown id", () => {
		expect(getNextContestantId("unknown", 2025)).toBeNull();
	});
});

describe("getPreviousContestantId", () => {
	it("returns previous id in array", () => {
		expect(getPreviousContestantId("esc2025_2", 2025)).toBe("esc2025_1");
	});

	it("wraps around at start of array", () => {
		expect(getPreviousContestantId("esc2025_1", 2025)).toBe(
			contestants2025[contestants2025.length - 1].id,
		);
	});

	it("returns null for unknown id", () => {
		expect(getPreviousContestantId("unknown", 2025)).toBeNull();
	});
});

describe("contestant data integrity", () => {
	it("has unique ids within each year", () => {
		for (const year of VALID_YEARS) {
			const contestants = getContestantsByYear(year);
			const ids = contestants.map((c) => c.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it("has flag URLs for all contestants", () => {
		for (const year of VALID_YEARS) {
			const contestants = getContestantsByYear(year);
			for (const c of contestants) {
				expect(c.flagUrl).toBeTruthy();
				expect(c.flagUrl).not.toBe("/flags/placeholder.svg");
			}
		}
	});
});
