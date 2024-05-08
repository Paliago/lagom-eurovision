import { RatingEntity, ratingFields } from "../state/rating.js";

export const calcTotalRating = (
  rating: RatingEntity | null,
): string | number => {
  if (!rating) {
    return "";
  }
  if (!ratingFields.every((field) => rating[field] !== undefined)) {
    return "";
  }

  const total = ratingFields.reduce(
    (acc, field) => acc + (Number(rating[field]) || 0),
    0,
  );
  return (total / ratingFields.length).toFixed(2);
};

export function getTextColorBasedOnBgColor(bgColor: string) {
  const color = bgColor.startsWith("#") ? bgColor.slice(1) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Using the luminance formula to find brightness of the color
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? "#000000" : "#FFFFFF";
}

type AverageRating = {
  number: number;
  music: number;
  performance: number;
  vibe: number;
  average: number;
};

export const calculateAverages = (
  ratings: RatingEntity[] | null,
  ranked: boolean = false,
): AverageRating[] => {
  if (!ratings) return [];

  const ratingSums: {
    [key: number]: { music: number[]; performance: number[]; vibe: number[] };
  } = {};

  ratings.forEach((rating) => {
    if (!ratingSums[rating.number]) {
      ratingSums[rating.number] = { music: [], performance: [], vibe: [] };
    }
    if (rating.music) {
      ratingSums[rating.number].music.push(rating.music);
    }
    if (rating.performance) {
      ratingSums[rating.number].performance.push(rating.performance);
    }
    if (rating.vibe) {
      ratingSums[rating.number].vibe.push(rating.vibe);
    }
  });

  const averages: AverageRating[] = Object.keys(ratingSums).map((number) => {
    const num = parseInt(number);
    const musicAvg =
      ratingSums[num].music.reduce((a, b) => a + b, 0) /
      ratingSums[num].music.length;
    const performanceAvg =
      ratingSums[num].performance.reduce((a, b) => a + b, 0) /
      ratingSums[num].performance.length;
    const vibeAvg =
      ratingSums[num].vibe.reduce((a, b) => a + b, 0) /
      ratingSums[num].vibe.length;
    const overallAvg = (musicAvg + performanceAvg + vibeAvg) / 3;

    return {
      number: num,
      music: parseFloat(musicAvg.toFixed(2)),
      performance: parseFloat(performanceAvg.toFixed(2)),
      vibe: parseFloat(vibeAvg.toFixed(2)),
      average: parseFloat(overallAvg.toFixed(2)),
    };
  });

  if (ranked) {
    averages.sort((a, b) => b.average - a.average);
  }

  return averages;
};

export const formatNumber = (num: number): string | undefined => {
  if (isNaN(num)) {
    return undefined;
  }
  const formatted = num.toFixed(2);
  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
};
