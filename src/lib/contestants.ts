// Define and export the Contestant type
export interface Contestant {
	id: string;
	name: string;
	song: string;
	country: string;
	flagUrl: string;
}

const countryToFlagFile: Record<string, string> = {
	Albania: "Flag_of_Albania.svg",
	Armenia: "Flag_of_Armenia.svg",
	Australia: "Flag_of_Australia_(converted).svg",
	Austria: "Flag_of_Austria.svg",
	Azerbaijan: "Flag_of_Azerbaijan.svg",
	Belarus: "Flag_of_Belarus.svg",
	Belgium: "Flag_of_Belgium.svg",
	Bulgaria: "Flag_of_Bulgaria.svg",
	Croatia: "Flag_of_Croatia.svg",
	Cyprus: "Flag_of_Cyprus.svg",
	Czechia: "Flag_of_the_Czech_Republic.svg",
	Denmark: "Flag_of_Denmark.svg",
	Estonia: "Flag_of_Estonia.svg",
	Finland: "Flag_of_Finland.svg",
	France: "Flag_of_France.svg",
	Georgia: "Flag of Georgia.svg",
	Germany: "Flag_of_Germany.svg",
	Greece: "Flag_of_Greece.svg",
	Iceland: "Flag_of_Iceland.svg",
	Ireland: "Flag_of_Ireland.svg",
	Israel: "Flag_of_Israel.svg",
	Italy: "Flag_of_Italy.svg",
	Latvia: "Flag_of_Latvia.svg",
	Lithuania: "Flag_of_Lithuania.svg",
	Luxembourg: "Flag_of_Luxembourg.svg",
	Malta: "Flag of Malta.svg",
	Moldova: "Flag_of_Moldova.svg",
	Montenegro: "Flag_of_Montenegro.svg",
	Netherlands: "Flag_of_the_Netherlands.svg",
	Norway: "Flag of Norway.svg",
	Poland: "Flag_of_Poland.svg",
	Portugal: "Flag_of_Portugal.svg",
	Romania: "Flag_of_Romania.svg",
	"San Marino": "Flag_of_San_Marino.svg",
	Serbia: "Flag_of_Serbia.svg",
	Slovenia: "Flag_of_Slovenia.svg",
	Spain: "Flag_of_Spain.svg",
	Sweden: "Flag_of_Sweden.svg",
	Switzerland: "Flag_of_Switzerland_(Pantone).svg",
	Ukraine: "Flag_of_Ukraine.svg",
	"United Kingdom": "Flag_of_the_United_Kingdom_(1-2).svg",
};

const getFlagUrl = (country: string): string => {
	const fileName = countryToFlagFile[country];
	if (fileName === undefined) {
		console.warn(`Mapping not found for country: ${country}`);
		return "/flags/placeholder.svg"; // Default placeholder if country not in map
	}
	if (!fileName) {
		// Handles cases like Portugal where the flag is explicitly missing
		return "/flags/placeholder.svg"; // Or an empty string if preferred: ""
	}
	return `/flags/${encodeURIComponent(fileName)}`;
};

export const DEFAULT_YEAR = 2026;
export const VALID_YEARS: number[] = [2025, 2026];

export const contestants2025: Contestant[] = [
	{
		id: "esc2025_1",
		name: "Kyle Alessandro",
		song: "Lighter",
		country: "Norway",
		flagUrl: getFlagUrl("Norway"),
	},
	{
		id: "esc2025_2",
		name: "Laura Thorn",
		song: "La poup\u{E9}e monte le son",
		country: "Luxembourg",
		flagUrl: getFlagUrl("Luxembourg"),
	},
	{
		id: "esc2025_3",
		name: "Tommy Cash",
		song: "Espresso Macchiato",
		country: "Estonia",
		flagUrl: getFlagUrl("Estonia"),
	},
	{
		id: "esc2025_4",
		name: "Yuval Raphael",
		song: "New Day Will Rise",
		country: "Israel",
		flagUrl: getFlagUrl("Israel"),
	},
	{
		id: "esc2025_5",
		name: "Katarsis",
		song: "Tavo akys",
		country: "Lithuania",
		flagUrl: getFlagUrl("Lithuania"),
	},
	{
		id: "esc2025_6",
		name: "Melody",
		song: "Esa diva",
		country: "Spain",
		flagUrl: getFlagUrl("Spain"),
	},
	{
		id: "esc2025_7",
		name: "Ziferblat",
		song: "Bird of Pray",
		country: "Ukraine",
		flagUrl: getFlagUrl("Ukraine"),
	},
	{
		id: "esc2025_8",
		name: "Remember Monday",
		song: "What the Hell Just Happened?",
		country: "United Kingdom",
		flagUrl: getFlagUrl("United Kingdom"),
	},
	{
		id: "esc2025_9",
		name: "JJ",
		song: "Wasted Love",
		country: "Austria",
		flagUrl: getFlagUrl("Austria"),
	},
	{
		id: "esc2025_10",
		name: "V\u{E6}b",
		song: "R\u{F3}a",
		country: "Iceland",
		flagUrl: getFlagUrl("Iceland"),
	},
	{
		id: "esc2025_11",
		name: "Tautumeitas",
		song: "Bur man laimi",
		country: "Latvia",
		flagUrl: getFlagUrl("Latvia"),
	},
	{
		id: "esc2025_12",
		name: "Claude",
		song: "C'est la vie",
		country: "Netherlands",
		flagUrl: getFlagUrl("Netherlands"),
	},
	{
		id: "esc2025_13",
		name: "Erika Vikman",
		song: "Ich komme",
		country: "Finland",
		flagUrl: getFlagUrl("Finland"),
	},
	{
		id: "esc2025_14",
		name: "Lucio Corsi",
		song: "Volevo essere un duro",
		country: "Italy",
		flagUrl: getFlagUrl("Italy"),
	},
	{
		id: "esc2025_15",
		name: "Justyna Steczkowska",
		song: "Gaja",
		country: "Poland",
		flagUrl: getFlagUrl("Poland"),
	},
	{
		id: "esc2025_16",
		name: "Abor & Tynna",
		song: "Baller",
		country: "Germany",
		flagUrl: getFlagUrl("Germany"),
	},
	{
		id: "esc2025_17",
		name: "Klavdia",
		song: "Asteromata",
		country: "Greece",
		flagUrl: getFlagUrl("Greece"),
	},
	{
		id: "esc2025_18",
		name: "Parg",
		song: "Survivor",
		country: "Armenia",
		flagUrl: getFlagUrl("Armenia"),
	},
	{
		id: "esc2025_19",
		name: "Zo\u{EB} M\u{EB}",
		song: "Voyage",
		country: "Switzerland",
		flagUrl: getFlagUrl("Switzerland"),
	},
	{
		id: "esc2025_20",
		name: "Miriana Conte",
		song: "Serving",
		country: "Malta",
		flagUrl: getFlagUrl("Malta"),
	},
	{
		id: "esc2025_21",
		name: "Napa",
		song: "Deslocado",
		country: "Portugal",
		flagUrl: getFlagUrl("Portugal"),
	},
	{
		id: "esc2025_22",
		name: "Sissal",
		song: "Hallucination",
		country: "Denmark",
		flagUrl: getFlagUrl("Denmark"),
	},
	{
		id: "esc2025_23",
		name: "KAJ",
		song: "Bara bada bastu",
		country: "Sweden",
		flagUrl: getFlagUrl("Sweden"),
	},
	{
		id: "esc2025_24",
		name: "Louane",
		song: "Maman",
		country: "France",
		flagUrl: getFlagUrl("France"),
	},
	{
		id: "esc2025_25",
		name: "Gabry Ponte",
		song: "Tutta l'Italia",
		country: "San Marino",
		flagUrl: getFlagUrl("San Marino"),
	},
	{
		id: "esc2025_26",
		name: "Shkodra Elektronike",
		song: "Zjerm",
		country: "Albania",
		flagUrl: getFlagUrl("Albania"),
	},
	// {
	// 	id: "esc2025_3",
	// 	name: "Go-Jo",
	// 	song: "Milkshake Man",
	// 	country: "Australia",
	// 	flagUrl: getFlagUrl("Australia"),
	// },
	// {
	// 	id: "esc2025_5",
	// 	name: "Mamagama",
	// 	song: "Run with U",
	// 	country: "Azerbaijan",
	// 	flagUrl: getFlagUrl("Azerbaijan"),
	// },
	// {
	// 	id: "esc2025_6",
	// 	name: "Red Sebastian",
	// 	song: "Strobe Lights",
	// 	country: "Belgium",
	// 	flagUrl: getFlagUrl("Belgium"),
	// },
	// {
	// 	id: "esc2025_7",
	// 	name: "Marko Bo\u{161}njak",
	// 	song: "Poison Cake",
	// 	country: "Croatia",
	// 	flagUrl: getFlagUrl("Croatia"),
	// },
	// {
	// 	id: "esc2025_8",
	// 	name: "Theo Evan",
	// 	song: "Shh",
	// 	country: "Cyprus",
	// 	flagUrl: getFlagUrl("Cyprus"),
	// },
	// {
	// 	id: "esc2025_9",
	// 	name: "Adonxs",
	// 	song: "Kiss Kiss Goodbye",
	// 	country: "Czechia",
	// 	flagUrl: getFlagUrl("Czechia"),
	// },
	// {
	// 	id: "esc2025_14_georgia",
	// 	name: "Mariam Shengelia",
	// 	song: "Freedom",
	// 	country: "Georgia",
	// 	flagUrl: getFlagUrl("Georgia"),
	// },
	// {
	// 	id: "esc2025_18_ireland",
	// 	name: "Emmy",
	// 	song: "Laika Party",
	// 	country: "Ireland",
	// 	flagUrl: getFlagUrl("Ireland"),
	// },
	// {
	// 	id: "esc2025_25_montenegro",
	// 	name: "Nina \u{17D}i\u{17E}i\u{107}",
	// 	song: "Dobrodo\u{161}li",
	// 	country: "Montenegro",
	// 	flagUrl: getFlagUrl("Montenegro"),
	// },
	// {
	// 	id: "esc2025_31",
	// 	name: "Princ",
	// 	song: "Mila",
	// 	country: "Serbia",
	// 	flagUrl: getFlagUrl("Serbia"),
	// },
	// {
	// 	id: "esc2025_32",
	// 	name: "Klemen",
	// 	song: "How Much Time Do We Have Left",
	// 	country: "Slovenia",
	// 	flagUrl: getFlagUrl("Slovenia"),
	// },
];

export const contestants2026: Contestant[] = [
	{
		id: "esc2026_1",
		name: "S\u{F8}ren Torpegaard Lund",
		song: "F\u{F8}r Vi G\u{E5}r Hjem",
		country: "Denmark",
		flagUrl: getFlagUrl("Denmark"),
	},
	{
		id: "esc2026_2",
		name: "Sarah Engels",
		song: "Fire",
		country: "Germany",
		flagUrl: getFlagUrl("Germany"),
	},
	{
		id: "esc2026_3",
		name: "Noam Bettan",
		song: "Michelle",
		country: "Israel",
		flagUrl: getFlagUrl("Israel"),
	},
	{
		id: "esc2026_4",
		name: "ESSYLA",
		song: "Dancing on the Ice",
		country: "Belgium",
		flagUrl: getFlagUrl("Belgium"),
	},
	{
		id: "esc2026_5",
		name: "Alis",
		song: "N\u{E2}n",
		country: "Albania",
		flagUrl: getFlagUrl("Albania"),
	},
	{
		id: "esc2026_6",
		name: "Akylas",
		song: "Ferto",
		country: "Greece",
		flagUrl: getFlagUrl("Greece"),
	},
	{
		id: "esc2026_7",
		name: "LEL\u{C9}KA",
		song: "Ridnym",
		country: "Ukraine",
		flagUrl: getFlagUrl("Ukraine"),
	},
	{
		id: "esc2026_8",
		name: "Delta Goodrem",
		song: "Eclipse",
		country: "Australia",
		flagUrl: getFlagUrl("Australia"),
	},
	{
		id: "esc2026_9",
		name: "LAVINA",
		song: "Kraj Mene",
		country: "Serbia",
		flagUrl: getFlagUrl("Serbia"),
	},
	{
		id: "esc2026_10",
		name: "AIDAN",
		song: "Bella",
		country: "Malta",
		flagUrl: getFlagUrl("Malta"),
	},
	{
		id: "esc2026_11",
		name: "Daniel Zizka",
		song: "CROSSROADS",
		country: "Czechia",
		flagUrl: getFlagUrl("Czechia"),
	},
	{
		id: "esc2026_12",
		name: "DARA",
		song: "Bangaranga",
		country: "Bulgaria",
		flagUrl: getFlagUrl("Bulgaria"),
	},
	{
		id: "esc2026_13",
		name: "LELEK",
		song: "Andromeda",
		country: "Croatia",
		flagUrl: getFlagUrl("Croatia"),
	},
	{
		id: "esc2026_14",
		name: "LOOK MUM NO COMPUTER",
		song: "Eins, Zwei, Drei",
		country: "United Kingdom",
		flagUrl: getFlagUrl("United Kingdom"),
	},
	{
		id: "esc2026_15",
		name: "Monroe",
		song: "Regarde !",
		country: "France",
		flagUrl: getFlagUrl("France"),
	},
	{
		id: "esc2026_16",
		name: "Satoshi",
		song: "Viva, Moldova!",
		country: "Moldova",
		flagUrl: getFlagUrl("Moldova"),
	},
	{
		id: "esc2026_17",
		name: "Linda Lampenius x Pete Parkkonen",
		song: "Liekinheitin",
		country: "Finland",
		flagUrl: getFlagUrl("Finland"),
	},
	{
		id: "esc2026_18",
		name: "ALICJA",
		song: "Pray",
		country: "Poland",
		flagUrl: getFlagUrl("Poland"),
	},
	{
		id: "esc2026_19",
		name: "Lion Ceccah",
		song: "S\u{F3}lo Quiero M\u{E1}s",
		country: "Lithuania",
		flagUrl: getFlagUrl("Lithuania"),
	},
	{
		id: "esc2026_20",
		name: "FELICIA",
		song: "My System",
		country: "Sweden",
		flagUrl: getFlagUrl("Sweden"),
	},
	{
		id: "esc2026_21",
		name: "Antigoni",
		song: "JALLA",
		country: "Cyprus",
		flagUrl: getFlagUrl("Cyprus"),
	},
	{
		id: "esc2026_22",
		name: "Sal Da Vinci",
		song: "Per Sempre S\u{EC}",
		country: "Italy",
		flagUrl: getFlagUrl("Italy"),
	},
	{
		id: "esc2026_23",
		name: "JONAS LOVV",
		song: "YA YA YA",
		country: "Norway",
		flagUrl: getFlagUrl("Norway"),
	},
	{
		id: "esc2026_24",
		name: "Alexandra C\u{103}pit\u{103}nescu",
		song: "Choke Me",
		country: "Romania",
		flagUrl: getFlagUrl("Romania"),
	},
	{
		id: "esc2026_25",
		name: "COSM\u{D3}",
		song: "Tanzschein",
		country: "Austria",
		flagUrl: getFlagUrl("Austria"),
	},
];

const CONTESTANTS_BY_YEAR: Record<number, Contestant[]> = {
	2025: contestants2025,
	2026: contestants2026,
};

export function getContestantsByYear(year: number): Contestant[] {
	return CONTESTANTS_BY_YEAR[year] || contestants2026;
}

export const getContestantById = (id: string, year: number = DEFAULT_YEAR) =>
	getContestantsByYear(year).find((c) => c.id === id);

export const getNextContestantId = (
	currentId: string,
	year: number = DEFAULT_YEAR,
): string | null => {
	const arr = getContestantsByYear(year);
	const currentIndex = arr.findIndex((c) => c.id === currentId);
	if (currentIndex === -1) {
		return null; // Should not happen if currentId is valid
	}
	if (currentIndex === arr.length - 1) {
		return arr[0].id; // Wrap to the first contestant
	}
	return arr[currentIndex + 1].id;
};

export const getPreviousContestantId = (
	currentId: string,
	year: number = DEFAULT_YEAR,
): string | null => {
	const arr = getContestantsByYear(year);
	const currentIndex = arr.findIndex((c) => c.id === currentId);
	if (currentIndex === -1) {
		return null; // Should not happen if currentId is valid
	}
	if (currentIndex === 0) {
		return arr[arr.length - 1].id; // Wrap to the last contestant
	}
	return arr[currentIndex - 1].id;
};

// Backward-compatible default export for pages that still reference it directly
export const contestants = contestants2026;
