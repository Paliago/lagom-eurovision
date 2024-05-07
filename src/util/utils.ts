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
  return luminance > 186 ? "#000000" : "#FFFFFF"; // threshold value can be adjusted based on needs
}
