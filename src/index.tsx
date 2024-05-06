import { Reflect } from "@rocicorp/reflect/client";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import c from "./index.module.css";
import { randUserInfo } from "./client-state.js";
import { mutators } from "./mutators.js";
import RatingCard from "./rating-card";

const userID = nanoid();
const roomID = "my-room";

const server: string | undefined = import.meta.env.VITE_REFLECT_URL;
if (!server) {
  throw new Error("VITE_REFLECT_URL required");
}

const r = new Reflect({
  server,
  userID,
  roomID,
  auth: userID,
  mutators,
});

function App() {
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    void (async () => {
      const userInfo = randUserInfo();
      await r.mutate.initClientState(userInfo);
    })();
  }, []);

  return (
    <div className={c.outer}>
      {!inRoom && (
        <div className={c.outer}>
          <h4>Join a Room</h4>

          <input type="text" placeholder="UserName" />
          <input type="text" placeholder="RoomID" />
          <button>Join</button>
        </div>
      )}
      {inRoom && (
        <div>
          <RatingCard r={r} />
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("root element is null");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    // this makes sure that there is only one instance of the reflect client during hmr reloads
    await r.close();
    root.unmount();
  });
}
