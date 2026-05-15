const darkThemeColors = [
	"bg-[#3d1f1f]",
	"bg-[#3d2a1f]",
	"bg-[#2a3d1f]",
	"bg-[#1f3d2a]",
	"bg-[#1f2a3d]",
	"bg-[#2a1f3d]",
	"bg-[#3d1f2a]",
	"bg-[#3d3a1f]",
	"bg-[#1f3d3a]",
	"bg-[#3a1f3d]",
	"bg-[#2d3d1f]",
	"bg-[#1f2d3d]",
	"bg-[#3d1f3a]",
	"bg-[#3d2d1f]",
	"bg-[#1f3d2d]",
	"bg-[#2a1f2a]",
];

export const getBackgroundColorForRater = (raterId: string): string => {
	let hash = 0;
	for (let i = 0; i < raterId.length; i++) {
		const char = raterId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	const index = Math.abs(hash) % darkThemeColors.length;
	return darkThemeColors[index];
};
