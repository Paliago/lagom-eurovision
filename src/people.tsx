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

  return (
    <div className={c.row}>
      {presentClients.map((client) => (
        <div
          className={c.decal}
          style={{ backgroundColor: client.userInfo.color }}
          key={client.id}
        >
          {client.userInfo.avatar} {client.userInfo.userID}
        </div>
      ))}
    </div>
  );
}
