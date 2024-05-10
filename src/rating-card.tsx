import { Reflect } from "@rocicorp/reflect/client";
import { M } from "./state/mutators.js";
import c from "./rating-card.module.css";
import UserInputs from "./user-inputs.js";
import MemberRatings from "./member-ratings.js";
import { Contribution, getContributionDetails } from "./data/esc2024.js";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePresence, useSubscribe } from "@rocicorp/reflect/react";
import { getClientState } from "./state/client-state.js";
import Flag from "react-world-flags";

export default function RatingCard({
  r,
  index,
  setIndex,
}: {
  r: Reflect<M>;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
}) {
  const [contribution, setContribution] = useState<Contribution>({
    country: "",
    number: 1,
    song: "",
    artist: "",
    flag: "",
  });

  useEffect(() => {
    async function loadContributions() {
      const contr = getContributionDetails(index);
      setContribution(contr);
    }

    loadContributions().catch(console.error);
  }, [index]);

  const handlePrev = () => {
    setIndex((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => prev + 1);
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
      <div className={c.controller}>
        <button onClick={handlePrev} className={c.arrows}>
          👈
        </button>
        <div>
          <Flag code={contribution.flag} height="100" />
          <div className={c.textBox}>
            <div>
              {contribution.number}. {contribution.country}
            </div>
            <div>
              {contribution.song} - {contribution.artist}
            </div>
          </div>
        </div>
        <button onClick={handleNext} className={c.arrows}>
          👉
        </button>
      </div>

      <div className={c.row}>
        <div className={c.icon} title="Music" onClick={infoBubble}>
          🎶
        </div>
        <div
          className={c.icon}
          title="Performance and show"
          onClick={infoBubble}
        >
          🕺
        </div>
        <div className={c.icon} title="Vibes 🌊🌊" onClick={infoBubble}>
          🧑‍🎤
        </div>
        <div className={c.icon} title="Average" onClick={infoBubble}>
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
