import { Reflect } from "@rocicorp/reflect/client";
import React, { useEffect } from "react";
import { useState } from "react";
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
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [index, setIndex] = useState(1);

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
            <input
              type="text"
              onChange={(e) => setUserID(e.target.value)}
              placeholder="Enter your username"
              className={c.inputField}
            />
            <input
              type="text"
              onChange={(e) => setRoomID(e.target.value)}
              placeholder="Enter room ID"
              className={c.inputField}
            />
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
            <Scoreboard r={reflect} />
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
    <App />
  </React.StrictMode>,
);
