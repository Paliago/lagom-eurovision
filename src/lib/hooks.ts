import { useCallback, useMemo, useSyncExternalStore } from "react";

function getSnapshot(key: string): string | null {
	return localStorage.getItem(key);
}

function getServerSnapshot(): string | null {
	return null;
}

function subscribe(key: string, callback: () => void) {
	const handler = (e: StorageEvent) => {
		if (e.key === key) {
			callback();
		}
	};
	window.addEventListener("storage", handler);
	return () => window.removeEventListener("storage", handler);
}

export function useLocalStorageItem(key: string): string | null {
	const getSnap = useCallback(() => getSnapshot(key), [key]);
	const sub = useCallback((cb: () => void) => subscribe(key, cb), [key]);

	return useSyncExternalStore(sub, getSnap, getServerSnapshot);
}

export function useEurovisionUser(): {
	userId: string | null;
	nickname: string | null;
	roomId: string | null;
} {
	const userId = useLocalStorageItem("eurovisionUserId");
	const nickname = useLocalStorageItem("eurovisionNickname");
	const roomId = useLocalStorageItem("eurovisionRoomId");

	return useMemo(
		() => ({ userId, nickname, roomId }),
		[userId, nickname, roomId],
	);
}
