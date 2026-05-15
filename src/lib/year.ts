import { useParams } from "react-router";
import { DEFAULT_YEAR, VALID_YEARS } from "./contestants";

export function useAppYear(): number {
	const { year } = useParams<{ year?: string }>();
	if (year) {
		const parsed = Number.parseInt(year, 10);
		if (VALID_YEARS.includes(parsed)) return parsed;
	}
	return DEFAULT_YEAR;
}

export function buildRoomPath(
	year: number,
	roomName: string,
	suffix: string,
): string {
	const base = `/room/${roomName}${suffix}`;
	if (year === DEFAULT_YEAR) return base;
	return `/${year}${base}`;
}
