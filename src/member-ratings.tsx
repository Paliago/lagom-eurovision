import { Reflect } from "@rocicorp/reflect/client";
import styles from "./member-ratings.module.css";
import { M } from "./state/mutators";
import { useRating } from "./state/subscriptions";

export default function MemberRatings({
  r,
  color,
  songNumber,
  userID,
}: {
  r: Reflect<M>;
  color: string;
  songNumber: number;
  userID: string;
}) {
  const rating = useRating(r, {
    songNumber,
    userID,
  });

  return (
    <div className={styles.inputRow}>
      <p>{userID}</p>
      <input
        type="number"
        value={rating?.music || ""}
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={rating?.performance || ""}
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={rating?.vibe || ""}
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={
          rating && rating.music && rating.performance && rating.vibe
            ? (rating?.vibe + rating?.music + rating?.performance) / 3
            : ""
        }
        className={styles.ratingsTotal}
        style={{ borderColor: color }}
        disabled
      />
    </div>
  );
}
