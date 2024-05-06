import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./mutators.js";
import c from "./rating-card.module.css";
import UserInputs from "./user-inputs.js";
import MemberRatings from "./member-ratings.js";
import { Contribution, getContributionDetails } from "./data/esc2024.js";
import { useEffect, useState } from "react";

export default function RatingCard({ r }: { r: Reflect<M> }) {
  const [contrIndex, setContrIndex] = useState(1);
  const [contribution, setContribution] = useState<Contribution>({
    country: "",
    number: 1,
    song: "",
    artist: "",
    flag: "",
  });

  useEffect(() => {
    async function loadContributions() {
      const contr = getContributionDetails(contrIndex);
      setContribution(contr);
    }

    loadContributions().catch(console.error);
  }, [contrIndex]);

  const handlePrev = () => {
    setContrIndex((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setContrIndex((prev) => prev + 1);
  };

  return (
    <div className={c.outerContainer}>
      <div className={c.row}>
        <div className={c.text}>{contribution.country}</div>
      </div>

      <div className={c.row}>
        <button onClick={handlePrev}>👈</button>
        <h4 className={c.text}>
          {contribution.number}. {contribution.song} - {contribution.artist}
        </h4>
        <button onClick={handleNext}>👉</button>
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
