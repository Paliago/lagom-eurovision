import type React from "react";
import { Link, useParams } from "react-router";
import { getContestantsByYear } from "@/lib/contestants";
import { useAppYear, buildRoomPath } from "@/lib/year";
import { useHaptics } from "@/lib/haptics";
import { Music } from "lucide-react";

const ContestantListPage: React.FC = () => {
	const { roomName } = useParams<{ roomName: string }>();
	const year = useAppYear();
	const contestants = getContestantsByYear(year);
	const { trigger } = useHaptics();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between mb-2">
				<h2 className="text-2xl font-extrabold tracking-tight text-[#f0f0f5]">
					Contestants
				</h2>
				<span className="text-xs font-semibold text-[#8a8a9a] bg-[#1a1a26] border border-white/[0.08] px-3 py-1 rounded-full">
					{contestants.length} entries
				</span>
			</div>

			<ul className="space-y-2">
				{contestants.map((contestant, index) => (
					<li
						key={contestant.id}
						className="animate-enter"
						style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
					>
						<Link
							to={buildRoomPath(
								year,
								roomName || "",
								`/contestant/${contestant.id}`,
							)}
							onClick={() => trigger("light")}
							className="group flex items-center gap-4 p-3.5 rounded-xl bg-[#1a1a26] border border-white/[0.06] transition-all duration-200 hover:bg-[#222233] hover:border-white/[0.12] active:scale-[0.98]"
						>
							<span className="text-xs font-bold text-[#8a8a9a] w-6 text-center shrink-0">
								{index + 1}
							</span>

							<img
								src={contestant.flagUrl}
								alt={`${contestant.country} flag`}
								className="w-9 h-6 object-cover rounded shadow-sm shrink-0"
								loading="lazy"
							/>

							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-[#f0f0f5] truncate leading-tight">
									{contestant.name}
								</p>
								<p className="text-xs text-[#8a8a9a] font-medium truncate mt-0.5 flex items-center gap-1">
									<Music className="size-3 opacity-60" />
									{contestant.song}
								</p>
							</div>

							<span className="text-[10px] font-bold text-[#8a8a9a] bg-[#12121a] px-2 py-1 rounded-md shrink-0 uppercase tracking-wide">
								{contestant.country}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ContestantListPage;
