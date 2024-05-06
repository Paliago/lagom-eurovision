import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./mutators.js";
import c from "./rating-card.module.css";
import UserInputs from "./user-inputs.js";
import MemberRatings from "./member-ratings.js";

export default function RatingCard({ r }: { r: Reflect<M> }) {
  return (
    <div className={c.outerContainer}>
      <div className={c.row}>
        <div className={c.text}>Country</div>
      </div>
      <div className={c.row}>
        <button>👈</button>
        <h4 className={c.text}>1. Title - Artist</h4>
        <button>👉</button>
      </div>

      <div className={c.row}>
        <div className={c.text}>🎶</div>
        <div className={c.text}>🕺</div>
        <div className={c.text}>🧑‍🎤</div>
        <div className={c.text}>🟰</div>
      </div>

      <UserInputs r={r} />
      <MemberRatings r={r} color={"#f94144"} />
      <MemberRatings r={r} color={"#f3722c"} />
      <MemberRatings r={r} color={"#f8961e"} />
      <MemberRatings r={r} color={"#f9844a"} />
    </div>
  );
}
