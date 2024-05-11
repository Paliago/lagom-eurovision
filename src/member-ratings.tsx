import { Reflect } from "@rocicorp/reflect/client";
import c from "./member-ratings.module.css";
import { M } from "./state/mutators";
import { useRating } from "./state/subscriptions";
import { UserInfo } from "./state/user";
import { ratingFields } from "./state/rating.js";
import {
  calcTotalRating,
  formatNumber,
  getTextColorBasedOnBgColor,
} from "./util/utils";

export default function MemberRatings({
  r,
  userInfo: { userID, color, avatar, animalName },
  songNumber,
}: {
  r: Reflect<M>;
  userInfo: UserInfo;
  songNumber: number;
}) {
  const rating = useRating(r, {
    songNumber,
    userID,
  });

  return (
    <div className={c.inputRow} style={{ backgroundColor: color }}>
      <div
        className={c.row}
        style={{ color: getTextColorBasedOnBgColor(color) }}
      >
        <div className={c.avatar} title={animalName}>
          {avatar}
        </div>
        <div
          className={c.userName}
          style={{ color: getTextColorBasedOnBgColor(color) }}
        >
          {userID}
        </div>
      </div>
      <div className={c.ratingRow}>
        {ratingFields.map((field) => (
          <input
            key={field}
            type="number"
            value={rating?.[field] || ""}
            className={c.ratings}
            disabled
          />
        ))}
        <input
          type="number"
          className={c.ratingsTotal}
          value={formatNumber(calcTotalRating(rating))}
          disabled
        />
      </div>
    </div>
  );
}
