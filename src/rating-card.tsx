import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./state/mutators.js";
import c from "./rating-card.module.css";
import UserInputs from "./user-inputs.js";
import MemberRatings from "./member-ratings.js";
import { Contribution, getContributionDetails } from "./data/esc2024.js";
import { useEffect, useState } from "react";
import People from "./people.js";
import { usePresence, useSubscribe } from "@rocicorp/reflect/react";
import { getClientState } from "./state/client-state.js";
import Flag from "react-world-flags";

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

  const presentClientIDs = usePresence(r);
  const presentClients = useSubscribe(
    r,
    async (tx) => {
      const result = [];

      for (const clientID of presentClientIDs) {
        const presentClient = await getClientState(tx, clientID);

        if (presentClient) {
          result.push(presentClient);
        }
      }

      return result;
    },
    [],
    [presentClientIDs],
  );

  return (
    <div className={c.outerContainer}>
      <People r={r} />

      <div className={c.row}>
        <div>
          <Flag code={contribution.flag} />
          <p className={c.text}>{contribution.country}</p>
        </div>
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

      {presentClients.map((client) => (
        <MemberRatings
          color={client.userInfo.color}
          userID={client.userInfo.userID}
          key={client.id}
        />
      ))}
    </div>
  );
}
