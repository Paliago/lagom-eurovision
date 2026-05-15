import type React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { getAnimalEmojiForUser } from "@/lib/emoji";
import { useAppYear, buildRoomPath } from "@/lib/year";
import { useEurovisionUser } from "@/lib/hooks";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { roomName } = useParams<{ roomName?: string }>();
	const navigate = useNavigate();
	const year = useAppYear();
	const { nickname: storedNickname, roomId: storedRoomId, userId } = useEurovisionUser();
	const nickname = storedNickname || "Guest";

	const handleViewOverview = () => {
		if (roomName) {
			void navigate(buildRoomPath(year, roomName, "/overview"));
		} else if (storedRoomId) {
			console.warn(
				"Navigating to overview without roomName in URL, using stored info or redirecting to home.",
			);
			void navigate("/");
		} else {
			void navigate("/");
		}
	};

	const handleNavigateToContestantList = () => {
		if (roomName) {
			void navigate(buildRoomPath(year, roomName, "/contestants"));
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<header className="p-4 shadow-md bg-white/80 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto flex items-center justify-between">
					<div className="flex-1 flex justify-start">
						<Button
							variant="ghost"
							onClick={handleViewOverview}
							className="text-purple-700 hover:text-purple-900 hover:bg-purple-100/50"
							size="icon"
							title="View Overview"
						>
							<span className="text-2xl">📊</span>
						</Button>
					</div>

					<div className="flex-grow text-center">
						{roomName ? (
							<Button
								variant="link"
								onClick={handleNavigateToContestantList}
								className="text-lg font-semibold text-purple-700 hover:text-purple-800 px-2 py-1"
								title="View Contestant List"
							>
								{roomName}
							</Button>
						) : (
							<p className="text-lg font-semibold text-purple-700">
								{/* Fallback or empty if no roomName */}
							</p>
						)}
					</div>

					<div className="flex-1 flex justify-end items-center space-x-2">
						<span className="text-lg">
							{getAnimalEmojiForUser(userId ?? "")}
						</span>
						<p className="text-gray-600 text-base font-semibold">{nickname}</p>
					</div>
				</div>
			</header>
			<main className="flex-grow container mx-auto p-4 md:p-8">{children}</main>
		</div>
	);
};

export default Layout;
