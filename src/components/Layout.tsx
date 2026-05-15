import type React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { BarChart3, ListMusic, LogOut, ChevronLeft } from "lucide-react";
import { getAnimalEmojiForUser } from "@/lib/emoji";
import { useAppYear, buildRoomPath } from "@/lib/year";
import { useEurovisionUser } from "@/lib/hooks";
import { useHaptics } from "@/lib/haptics";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { roomName } = useParams<{ roomName?: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const year = useAppYear();
	const { nickname: storedNickname, roomId: storedRoomId, userId } = useEurovisionUser();
	const nickname = storedNickname || "Guest";
	const { trigger } = useHaptics();

	const isContestantList = location.pathname.includes("/contestants");
	const isOverview = location.pathname.includes("/overview");
	const isRating = location.pathname.includes("/contestant/");

	const handleViewOverview = () => {
		trigger("light");
		if (roomName) {
			void navigate(buildRoomPath(year, roomName, "/overview"));
		} else if (storedRoomId) {
			void navigate("/");
		} else {
			void navigate("/");
		}
	};

	const handleNavigateToContestantList = () => {
		trigger("light");
		if (roomName) {
			void navigate(buildRoomPath(year, roomName, "/contestants"));
		}
	};

	const handleLeaveRoom = () => {
		if (!window.confirm("Leave this room? Your ratings are saved.")) {
			return;
		}
		trigger("medium");
		localStorage.removeItem("eurovisionRoomId");
		localStorage.removeItem("eurovisionNickname");
		localStorage.removeItem("eurovisionUserId");
		void navigate("/");
	};

	const handleBackFromRating = () => {
		trigger("light");
		if (roomName) {
			void navigate(buildRoomPath(year, roomName, "/contestants"));
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-[#0a0a0f]">
			{/* Top bar */}
			<header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06]">
				<div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						{isRating ? (
							<button
								onClick={handleBackFromRating}
								className="flex items-center gap-1 text-[#8a8a9a] hover:text-[#f0f0f5] transition-colors duration-200 active:scale-95 shrink-0"
							>
								<ChevronLeft className="size-5" />
								<span className="text-sm font-medium hidden sm:inline">Back</span>
							</button>
						) : (
							<div className="w-8" />
						)}
					</div>

					<div className="flex-shrink-0 text-center">
						{roomName ? (
							<button
								onClick={handleNavigateToContestantList}
								className="text-[#f0f0f5] font-[family-name:var(--font-display)] text-lg font-bold tracking-tight hover:text-[#f5b800] transition-colors duration-200"
							>
								{roomName}
							</button>
						) : (
							<span className="text-[#f0f0f5] font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
								Lagom
							</span>
							)}
					</div>

					<div className="flex items-center justify-end gap-2 min-w-0 flex-1">
						<span className="text-lg leading-none" title="Your avatar">
							{getAnimalEmojiForUser(userId ?? "")}
						</span>
						<span className="text-sm font-medium text-[#8a8a9a] truncate max-w-[80px]">
							{nickname}
						</span>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 overflow-hidden flex flex-col w-full max-w-lg mx-auto px-4">
				{children}
			</main>

			{/* Bottom tab bar — only show inside rooms */}
			{roomName && (
				<nav className="sticky bottom-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
					<div id="bottom-navbar-content" className="max-w-lg mx-auto px-4" />
					<div className="max-w-lg mx-auto h-14 flex items-stretch">
						<button
							onClick={handleNavigateToContestantList}
							className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors duration-200 active:scale-95 ${
								isContestantList ? "text-[#f5b800]" : "text-[#8a8a9a] hover:text-[#f0f0f5]"
							}`}
						>
							<ListMusic className="size-5" strokeWidth={isContestantList ? 2.5 : 1.5} />
							<span className="text-[10px] font-semibold tracking-wide">List</span>
						</button>

						<button
							onClick={handleViewOverview}
							className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors duration-200 active:scale-95 ${
								isOverview ? "text-[#f5b800]" : "text-[#8a8a9a] hover:text-[#f0f0f5]"
							}`}
						>
							<BarChart3 className="size-5" strokeWidth={isOverview ? 2.5 : 1.5} />
							<span className="text-[10px] font-semibold tracking-wide">Scores</span>
						</button>

						<button
							onClick={handleLeaveRoom}
							className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] text-[#8a8a9a] hover:text-red-400 transition-colors duration-200 active:scale-95"
						>
							<LogOut className="size-5" strokeWidth={1.5} />
							<span className="text-[10px] font-semibold tracking-wide">Leave</span>
						</button>
					</div>
				</nav>
			)}
		</div>
	);
};

export default Layout;
