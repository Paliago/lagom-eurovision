export const getCountryDetails = (countries: string[]): Contribution[] =>
  countries.map((country, i) => {
    if (contributions[country]) {
      return {
        number: i,
        country: country.charAt(0).toUpperCase() + country.slice(1),
        flag: contributions[country].code,
        song: contributions[country].song,
        artist: contributions[country].artist,
      };
    } else {
      return {
        number: i,
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
  getCountryDetails(countryList())[i];

export const countryList = () => Object.keys(contributions);

type Contributions = Record<
  string,
  { song: string; artist: string; code: string }
>;

export const contributions: Contributions = {
  albania: {
    song: "TITAN",
    artist: "BESA",
    code: "AL",
  },
  armenia: {
    song: "Jako",
    artist: "LADANIVA",
    code: "AM",
  },
  // australia: {
  //   song: "One Milkali (One Blood)",
  //   artist: "Electric Fields",
  //   code: "AU",
  // },
  austria: {
    song: "We Will Rave",
    artist: "Kaleen",
    code: "AT",
  },
  // azerbaijan: {
  //   song: "Özünlə Apar",
  //   artist: "FAHREE feat Ilkin Dovlatov",
  //   code: "AZ",
  // },
  belgium: {
    song: "Before the Party's Over",
    artist: "Mustii",
    code: "BE",
  },
  croatia: {
    song: "Rim Tim Tagi Dim",
    artist: "Baby Lasagna",
    code: "HR",
  },
  cyprus: {
    song: "Liar",
    artist: "Silia Kapsis",
    code: "CY",
  },
  czechia: {
    song: "Pedestal",
    artist: "Aiko",
    code: "CZ",
  },
  denmark: {
    song: "SAND",
    artist: "SABA",
    code: "DK",
  },
  estonia: {
    song: "(nendest) narkootikumidest ei tea me (küll) midagi",
    artist: "5MIINUST x Puuluup",
    code: "EE",
  },
  finland: {
    song: "No Rules!",
    artist: "Windows95man",
    code: "FI",
  },
  france: {
    song: "Mon amour",
    artist: "Slimane",
    code: "FR",
  },
  georgia: {
    song: "Firefighter",
    artist: "Nutsa Buzaladze",
    code: "GE",
  },
  germany: {
    song: "Always On The Run",
    artist: "ISAAK",
    code: "DE",
  },
  greece: {
    song: "ZARI",
    artist: "Marina Satti",
    code: "GR",
  },
  // iceland: {
  //   song: "Scared of Heights",
  //   artist: "Hera Björk",
  //   code: "IS",
  // },
  ireland: {
    song: "Doomsday Blue",
    artist: "Bambie Thug",
    code: "IE",
  },
  israel: {
    song: "Hurricane",
    artist: "Eden Golan",
    code: "IL",
  },
  italy: {
    song: "La noia",
    artist: "Angelina Mango",
    code: "IT",
  },
  latvia: {
    song: "Hollow",
    artist: "Dons",
    code: "LV",
  },
  lithuania: {
    song: "Luktelk",
    artist: "Silvester Belt",
    code: "LT",
  },
  luxembourg: {
    song: "Fighter",
    artist: "TALI",
    code: "LU",
  },
  malta: {
    song: "Loop",
    artist: "Sarah Bonnici",
    code: "MT",
  },
  // moldova: {
  //   song: "In The Middle",
  //   artist: "Natalia Barbu",
  //   code: "MD",
  // },
  netherlands: {
    song: "Europapa",
    artist: "Joost Klein",
    code: "NL",
  },
  norway: {
    song: "Ulveham",
    artist: "Gåte",
    code: "NO",
  },
  // poland: {
  //   song: "The Tower",
  //   artist: "LUNA",
  //   code: "PL",
  // },
  portugal: {
    song: "Grito",
    artist: "iolanda",
    code: "PT",
  },
  san_marino: {
    song: "11:11",
    artist: "MEGARA",
    code: "SM",
  },
  serbia: {
    song: "Ramonda",
    artist: "Teya Dora",
    code: "RS",
  },
  slovenia: {
    song: "Veronika",
    artist: "Raiven",
    code: "SI",
  },
  spain: {
    song: "ZORRA",
    artist: "Nebulossa",
    code: "ES",
  },
  sweden: {
    song: "Unforgettable",
    artist: "Marcus & Martinus",
    code: "SE",
  },
  switzerland: {
    song: "The Code",
    artist: "Nemo",
    code: "CH",
  },
  ukraine: {
    song: "Teresa & Maria",
    artist: "alyona alyona & Jerry Heil",
    code: "UA",
  },
  united_kingdom: {
    song: "Dizzy",
    artist: "Olly Alexander",
    code: "GB",
  },
};
