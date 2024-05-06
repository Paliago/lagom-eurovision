import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./mutators.js";
import styles from "./member-ratings.module.css";

export default function MemberRatings({
  r,
  color,
}: {
  r: Reflect<M>;
  color: string;
}) {
  return (
    <div className={styles.inputRow}>
      <input
        type="number"
        value={6}
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={6}
        placeholder="6"
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={6}
        className={styles.ratings}
        style={{ borderColor: color }}
        min={0}
        max={10}
        disabled
      />
      <input
        type="number"
        value={6}
        className={styles.ratingsTotal}
        style={{ borderColor: color }}
        disabled
      />
    </div>
  );
}
