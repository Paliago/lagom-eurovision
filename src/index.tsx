import { Reflect } from "@rocicorp/reflect/client";
import React, { useEffect } from "react";
import { ChangeEvent, useState } from "react";
import ReactDOM from "react-dom/client";
import c from "./index.module.css";
import { M, mutators } from "./state/mutators";
import RatingCard from "./rating-card";
import Scoreboard from "./scoreboard";

const server: string | undefined = import.meta.env.VITE_REFLECT_URL;
if (!server) {
  throw new Error("VITE_REFLECT_URL required");
}

export default function App() {
  const [reflect, setReflect] = useState<Reflect<M> | null>(null);
  const [userID, setUserID] = useState("");
  const [roomID, setRoomID] = useState("");
  const [showScoreboard, setShowScoreboard] = useState(false); // State to toggle scoreboard visibility

  const handleJoining = async () => {
    if (userID && roomID) {
      const reflect = new Reflect({
        server,
        userID,
        roomID,
        auth: userID,
        mutators,
      });

      await reflect.mutate.initClientState(userID);

      setReflect(reflect);
      setShowScoreboard(false); // Hide scoreboard when joining a new room
    } else {
      alert("Please enter both user name and room id");
    }
  };

  const toggleScoreboard = () => setShowScoreboard(!showScoreboard);

  useEffect(() => {
    return () => {
      if (reflect) {
        reflect.close();
      }
    };
  });

  return (
    <>
      <div className={c.outer}>
        <button
          onClick={toggleScoreboard}
          style={{ position: "fixed", top: 10, right: 10 }}
        >
          {showScoreboard ? "Back to Room" : "Show Scoreboard"}
        </button>

        {!reflect ? (
          <div className={c.outer}>
            <h4>Join a Room</h4>
            <input
              type="text"
              placeholder="UserName"
              onChange={(e) => setUserID(e.target.value)}
            />
            <input
              type="text"
              placeholder="RoomID"
              onChange={(e) => setRoomID(e.target.value)}
            />
            <button onClick={handleJoining}>Join</button>
          </div>
        ) : showScoreboard ? (
          <Scoreboard r={reflect} />
        ) : (
          <RatingCard r={reflect} />
        )}
      </div>
    </>
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
