import { Reflect } from "@rocicorp/reflect/client";
import { ChangeEvent } from "react";
import { Contribution } from "./data/esc2024.js";
import { M } from "./state/mutators.js";
import { useRating } from "./state/subscriptions.js";
import styles from "./user-inputs.module.css";
import { RatingEntity } from "./state/rating.js";

export default function UserInputs({
  r,
  contribution,
}: {
  r: Reflect<M>;
  contribution: Contribution;
}) {
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
          ...rating,
          [field]: newValue,
        },
      });
    };

  const fields: Array<keyof RatingEntity> = ["music", "performance", "vibe"];

  return (
    <div className={styles.inputRow}>
      <pre>{JSON.stringify(rating, null, 2)}</pre>
      {fields.map((field) => (
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
        value={
          rating && rating.music && rating.performance && rating.vibe
            ? (rating?.vibe + rating?.music + rating?.performance) / 3
            : ""
        }
        disabled
      />
    </div>
  );
}
