import { Reflect } from "@rocicorp/reflect/client";
import { ChangeEvent } from "react";
import { Contribution } from "./data/esc2024.js";
import { M } from "./state/mutators.js";
import { useClientState, useRating } from "./state/subscriptions.js";
import styles from "./user-inputs.module.css";
import { RatingEntity, ratingFields } from "./state/rating.js";
import { calcTotalRating } from "./util/utils.js";

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
      const newValue = Number(evt.target.value) || undefined;
      if (!newValue || newValue < 1 || newValue > 10) {
        return;
      }

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
          placeholder="6"
          className={styles.inputField}
          min={1}
          max={10}
          value={rating?.[field] || ""}
          onChange={handleChange(field)}
        />
      ))}
      <input
        type="number"
        className={styles.totalDisplay}
        value={calcTotalRating(rating)}
        disabled
      />
    </div>
  );
}
