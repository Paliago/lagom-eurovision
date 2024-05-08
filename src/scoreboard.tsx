import { Reflect } from "@rocicorp/reflect/client";
import { useState } from "react";
import Flag from "react-world-flags";
import { getContributionDetails } from "./data/esc2024";
import c from "./scoreboard.module.css";
import { M } from "./state/mutators";
import { useRatings } from "./state/subscriptions";
import { calculateAverages, formatNumber } from "./util/utils";

export default function Scoreboard({ r }: { r: Reflect<M> }) {
  const ratings = useRatings(r);
  const [ranked, setRanked] = useState(true);

  const organized = calculateAverages(ratings, ranked);

  return (
    <div className={c.outerContainer}>
      <button onClick={() => setRanked(!ranked)} className={c.button}>
        {ranked ? "Ranked" : "Ordered"}
      </button>

      <div className={c.row}>
        <div className={c.icon} title="Entry">
          🔢
        </div>
        <div className={c.icon} title="Country">
          🏳️
        </div>
        <div className={c.icon} title="Music">
          🎶
        </div>
        <div className={c.icon} title="Performance and show">
          🕺
        </div>
        <div className={c.icon} title="Vibes 🌊🌊">
          🧑‍🎤
        </div>
        <div className={c.icon} title="Average">
          🟰
        </div>
      </div>

      {organized.map((rating) => (
        <div className={c.row} key={rating.number}>
          <div className={c.text}>{rating.number}</div>
          <Flag
            code={getContributionDetails(rating.number).flag}
            height="19"
            title={getContributionDetails(rating.number).country}
          />
          <div className={c.text}>{formatNumber(rating.music)}</div>
          <div className={c.text}>{formatNumber(rating.performance)}</div>
          <div className={c.text}>{formatNumber(rating.vibe)}</div>
          <div className={c.text}>
            {formatNumber(
              (rating.music + rating.performance + rating.vibe) / 3,
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
