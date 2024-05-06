import { Reflect } from "@rocicorp/reflect/client";
import { usePresence, useSubscribe } from "@rocicorp/reflect/react";
import { getClientState } from "./state/client-state";
import { M } from "./state/mutators";
import c from "./people.module.css";

export default function People({ r }: { r: Reflect<M> }) {
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

  const currentUser = presentClients.find(
    (client) => client.userInfo.userID === r.userID,
  );

  return (
    <div className={c.row}>
      {presentClients.map((presentClient) => (
        <div
          className={c.decal}
          style={{ backgroundColor: presentClient.userInfo.color }}
          key={presentClient.id}
        >
          <div>{presentClient.userInfo.avatar}</div>

          <div>{presentClient.userInfo.userID}</div>
        </div>
      ))}
    </div>
  );
}
