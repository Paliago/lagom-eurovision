import { Reflect } from "@rocicorp/reflect/client";
import { ChangeEvent } from "react";
import { Contribution } from "./data/esc2024.js";
import { M } from "./state/mutators.js";
import { useClientState, useRating } from "./state/subscriptions.js";
import styles from "./user-inputs.module.css";
import { RatingEntity, ratingFields } from "./state/rating.js";
import { calcTotalRating, formatNumber } from "./util/utils.js";

export default function UserInputs({
  r,
  contribution,
}: {
  r: Reflect<M>;
  contribution: Contribution;
}) {
  const client = useClientState(r, r.clientID);
  const rating = useRating(r, {
    songNumber: contribution.number,
    userID: r.userID,
  });

  const handleChange =
    (field: keyof RatingEntity) => (evt: ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;
      const newValue = value === "" ? "" : Number(value);

      if (newValue === "" || (newValue >= 1 && newValue <= 12)) {
        r.mutate.setRating({
          userID: r.userID,
          rating: {
            number: contribution.number,
            music: rating?.music,
            performance: rating?.performance,
            vibe: rating?.vibe,
            [field]: newValue,
          },
        });
      }
    };

  return (
    <div
      className={styles.inputRow}
      style={{ backgroundColor: client?.userInfo.color }}
    >
      {ratingFields.map((field) => (
        <input
          key={field}
          type="number"
          className={styles.inputField}
          placeholder="1-12"
          min={1}
          max={12}
          value={rating?.[field] || ""}
          onChange={handleChange(field)}
        />
      ))}
      <input
        type="number"
        className={styles.totalDisplay}
        value={formatNumber(calcTotalRating(rating))}
        disabled
      />
    </div>
  );
}
