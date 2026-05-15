import type React from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { getContestantsByYear } from "@/lib/contestants";
import { useAppYear, buildRoomPath } from "@/lib/year";

const ContestantListPage: React.FC = () => {
	const { roomName } = useParams<{ roomName: string }>();
	const navigate = useNavigate();
	const year = useAppYear();
	const contestants = getContestantsByYear(year);

	return (
		<div className="flex justify-center">
			<Card className="w-full max-w-2xl bg-white/90 shadow-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-gray-900 text-center">
						Contestant List
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-3">
						{contestants.map((contestant, index) => (
							<li key={contestant.id}>
								<Button
									asChild
									variant="outline"
									className="w-full justify-start h-auto p-0 whitespace-normal"
								>
									<Link
										to={buildRoomPath(
											year,
											roomName || "",
											`/contestant/${contestant.id}`,
										)}
										className="block p-4 w-full"
									>
										<div className="flex items-center w-full">
											<img
												src={contestant.flagUrl}
												alt={`Flag of ${contestant.country}`}
												className="w-10 h-6 object-contain rounded mr-3 flex-shrink-0"
											/>
											<span className="text-gray-600 mr-2">{index + 1}.</span>
											<div className="min-w-0 flex-1">
												<span className="text-lg text-gray-800 break-words block font-semibold">
													{contestant.name} - {contestant.song}
												</span>
											</div>
										</div>
									</Link>
								</Button>
							</li>
						))}
					</ul>
				</CardContent>
				<CardFooter>
					<Button
						variant="outline"
						onClick={() => {
							localStorage.removeItem("eurovisionRoomId");
							localStorage.removeItem("eurovisionNickname");
							void navigate("/");
						}}
						className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
					>
						Leave Room
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ContestantListPage;
