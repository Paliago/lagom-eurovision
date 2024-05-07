import { Reflect } from "@rocicorp/reflect/client";
import c from "./member-ratings.module.css";
import { M } from "./state/mutators";
import { useRating } from "./state/subscriptions";
import { UserInfo } from "./state/user";
import { ratingFields } from "./state/rating.js";
import { calcTotalRating, getTextColorBasedOnBgColor } from "./util/utils";

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

  const textColor = getTextColorBasedOnBgColor(color);

  return (
    <div className={c.inputRow} style={{ backgroundColor: color }}>
      <div className={c.row} style={{ color: textColor }}>
        <div className={c.avatar} title={animalName}>
          {avatar}
        </div>
        <div className={c.userName}>{userID}</div>
      </div>
      <div className={c.row}>
        {ratingFields.map((field) => (
          <input
            key={field}
            type="number"
            value={rating?.[field] || ""}
            className={c.ratings}
            min={0}
            max={10}
            disabled
          />
        ))}
        <input
          type="number"
          className={c.ratingsTotal}
          value={calcTotalRating(rating)}
          disabled
        />
      </div>
    </div>
  );
}
