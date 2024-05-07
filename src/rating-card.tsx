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

  const infoBubble = () => {
    alert(
      "Music: How much you like the song\nPerformance and show: How much you like the performance and show\nVibes: How much you like the vibes of the song\nAverage: The average of the above three",
    );
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

      <div className={c.controller}>
        <button onClick={handlePrev}>👈</button>
        <div>
          <Flag code={contribution.flag} />
          <div className={c.text}>
            {contribution.number}. {contribution.country}
          </div>
          <div className={c.text}>
            {contribution.song} - {contribution.artist}
          </div>
        </div>
        <button onClick={handleNext}>👉</button>
      </div>

      <div className={c.row}>
        <div className={c.icon} title="Music" onClick={infoBubble}>
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

      <UserInputs r={r} contribution={contribution} />

      {presentClients.map(
        (client) =>
          client.id !== r.clientID && (
            <MemberRatings
              r={r}
              userInfo={client.userInfo}
              songNumber={contribution.number}
              key={client.id}
            />
          ),
      )}
    </div>
  );
}
