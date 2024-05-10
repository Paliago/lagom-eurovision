import { Reflect } from "@rocicorp/reflect/client";
import React, { useEffect } from "react";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import c from "./index.module.css";
import { M, mutators } from "./state/mutators";
import RatingCard from "./rating-card";
import Scoreboard from "./scoreboard";
import { BaselimeRum, useBaselimeRum } from "@baselime/react-rum";

const server: string | undefined = import.meta.env.VITE_REFLECT_URL;
const baselimeKey: string | undefined = import.meta.env.VITE_BASELIME_API_KEY;
if (!server) {
  throw new Error("VITE_REFLECT_URL required");
}

export default function App() {
  const [reflect, setReflect] = useState<Reflect<M> | null>(null);
  const [userID, setUserID] = useState("");
  const [roomID, setRoomID] = useState("");
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [index, setIndex] = useState(1);
  const [ranked, setRanked] = useState(true);
  const { sendEvent, setUser } = useBaselimeRum();

  const handleJoining = async () => {
    if (userID && roomID) {
      const reflect = new Reflect({
        server,
        userID,
        roomID,
        auth: userID,
        mutators,
      });

      setUser(`${roomID}/${userID}`);
      sendEvent("Room joined", {
        userID,
        roomID,
      });

      await reflect.mutate.initClientState(userID);

      setReflect(reflect);
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
  }, []);

  return (
    <div className={c.outer}>
      {!reflect ? (
        <div className={c.login}>
          <h1 className={c.title}>Lagom Eurovision</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoining();
            }}
            className={c.form}
          >
            <div>
              <div>Username</div>
              <input
                type="text"
                onChange={(e) => setUserID(e.target.value)}
                placeholder="Enter your username"
                className={c.inputField}
              />
            </div>
            <div>
              <div>Room ID (Type the same as your friends)</div>
              <input
                type="text"
                onChange={(e) => setRoomID(e.target.value)}
                placeholder="Enter room ID"
                className={c.inputField}
              />
            </div>
            <button type="submit" className={c.button}>
              Join
            </button>
          </form>
        </div>
      ) : (
        <>
          <button
            onClick={toggleScoreboard}
            className={c.buttonListButton}
            title={showScoreboard ? "Go to voting" : "Go to scoreboard"}
          >
            {showScoreboard ? "📝" : "🥇"}
          </button>
          {showScoreboard ? (
            <Scoreboard r={reflect} ranked={ranked} setRanked={setRanked} />
          ) : (
            <RatingCard r={reflect} index={index} setIndex={setIndex} />
          )}
        </>
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
    <BaselimeRum apiKey={baselimeKey}>
      <App />
    </BaselimeRum>
  </React.StrictMode>,
);
