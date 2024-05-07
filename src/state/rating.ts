import { generate } from "@rocicorp/rails";

export interface Rating {
  number: number;
  music?: number;
  performance?: number;
  vibe?: number;
}

export interface RatingEntity extends Rating {
  id: string;
}

export const buildId = (songNumber: number, userID: string) =>
  `${songNumber}:${userID}`;

export const {
  put: putRating,
  get: getRating,
  update: updateRating,
  delete: deleteRating,
  list: listRatings,
} = generate<RatingEntity>("rating");
