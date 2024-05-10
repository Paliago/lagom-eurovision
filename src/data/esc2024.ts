export const getCountryDetails = (countries: string[]): Contribution[] =>
  countries.map((country, i) => {
    if (contributions[country]) {
      return {
        number: i + 1,
        country: country.charAt(0).toUpperCase() + country.slice(1),
        flag: contributions[country].code,
        song: contributions[country].song,
        artist: contributions[country].artist,
      };
    } else {
      return {
        number: i + 1,
        country: country.charAt(0).toUpperCase() + country.slice(1),
        flag: "n/a",
        song: "n/a",
        artist: "n/a",
      };
    }
  });

export interface Contribution {
  number: number;
  country: string;
  song: string;
  artist: string;
  flag: string;
}

export const getContributionDetails = (i: number) =>
  getCountryDetails(countryList())[i - 1];

export const countryList = () => Object.keys(contributions);

type Contributions = Record<
  string,
  { song: string; artist: string; code: string }
>;

export const contributions: Contributions = {
  sweden: {
    song: "Unforgettable",
    artist: "Marcus & Martinus",
    code: "SE",
  },
  ukraine: {
    song: "Teresa & Maria",
    artist: "alyona alyona & Jerry Heil",
    code: "UA",
  },
  germany: {
    song: "Always On The Run",
    artist: "ISAAK",
    code: "DE",
  },
  luxembourg: {
    song: "Fighter",
    artist: "TALI",
    code: "LU",
  },
  netherlands: {
    song: "Europapa",
    artist: "Joost Klein",
    code: "NL",
  },
  israel: {
    song: "Hurricane",
    artist: "Eden Golan",
    code: "IL",
  },
  lithuania: {
    song: "Luktelk",
    artist: "Silvester Belt",
    code: "LT",
  },
  spain: {
    song: "ZORRA",
    artist: "Nebulossa",
    code: "ES",
  },
  estonia: {
    song: "(nendest) narkootikumidest ei tea me (küll) midagi",
    artist: "5MIINUST x Puuluup",
    code: "EE",
  },
  ireland: {
    song: "Doomsday Blue",
    artist: "Bambie Thug",
    code: "IE",
  },
  latvia: {
    song: "Hollow",
    artist: "Dons",
    code: "LV",
  },
  greece: {
    song: "ZARI",
    artist: "Marina Satti",
    code: "GR",
  },
  united_kingdom: {
    song: "Dizzy",
    artist: "Olly Alexander",
    code: "GB",
  },
  norway: {
    song: "Ulveham",
    artist: "Gåte",
    code: "NO",
  },
  italy: {
    song: "La noia",
    artist: "Angelina Mango",
    code: "IT",
  },
  serbia: {
    song: "Ramonda",
    artist: "Teya Dora",
    code: "RS",
  },
  finland: {
    song: "No Rules!",
    artist: "Windows95man",
    code: "FI",
  },
  portugal: {
    song: "Grito",
    artist: "iolanda",
    code: "PT",
  },
  armenia: {
    song: "Jako",
    artist: "LADANIVA",
    code: "AM",
  },
  cyprus: {
    song: "Liar",
    artist: "Silia Kapsis",
    code: "CY",
  },
  switzerland: {
    song: "The Code",
    artist: "Nemo",
    code: "CH",
  },
  slovenia: {
    song: "Veronika",
    artist: "Raiven",
    code: "SI",
  },
  croatia: {
    song: "Rim Tim Tagi Dim",
    artist: "Baby Lasagna",
    code: "HR",
  },
  georgia: {
    song: "Firefighter",
    artist: "Nutsa Buzaladze",
    code: "GE",
  },
  france: {
    song: "Mon amour",
    artist: "Slimane",
    code: "FR",
  },
  austria: {
    song: "We Will Rave",
    artist: "Kaleen",
    code: "AT",
  },
};
