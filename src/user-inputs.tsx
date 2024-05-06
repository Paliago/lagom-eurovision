import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./state/mutators.js";
import styles from "./user-inputs.module.css";

export default function UserInputs({ r }: { r: Reflect<M> }) {
  return (
    <div className={styles.inputRow}>
      <input
        type="number"
        placeholder="6"
        className={styles.inputField}
        min={0}
        max={10}
      />
      <input
        type="number"
        placeholder="6"
        className={styles.inputField}
        min={0}
        max={10}
      />
      <input
        type="number"
        placeholder="6"
        className={styles.inputField}
        min={0}
        max={10}
      />
      <input
        type="number"
        placeholder="6"
        className={styles.totalDisplay}
        value={7}
        disabled
      />
    </div>
  );
}
