import { Reflect } from "@rocicorp/reflect/client";
import React, { useEffect } from "react";
import { ChangeEvent, useState } from "react";
import ReactDOM from "react-dom/client";
import c from "./index.module.css";
import { M, mutators } from "./state/mutators";
import RatingCard from "./rating-card";

const server: string | undefined = import.meta.env.VITE_REFLECT_URL;
if (!server) {
  throw new Error("VITE_REFLECT_URL required");
}

export default function App() {
  const [r, setR] = useState<Reflect<M> | null>(null);
  const [userID, setUserID] = useState("");
  const [roomID, setRoomID] = useState("");

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

      setR(reflect);
    } else {
      alert("Please enter both user name and room id");
    }
  };

  const handleUserName = (evt: ChangeEvent<HTMLInputElement>) => {
    setUserID(evt.target.value);
  };

  const handleRoomID = (evt: ChangeEvent<HTMLInputElement>) => {
    setRoomID(evt.target.value);
  };

  useEffect(() => {
    return () => {
      if (r) {
        r.close();
      }
    };
  });

  return (
    <div className={c.outer}>
      {!r && (
        <div className={c.outer}>
          <h4>Join a Room</h4>

          <input type="text" placeholder="UserName" onChange={handleUserName} />
          <input type="text" placeholder="RoomID" onChange={handleRoomID} />
          <button onClick={handleJoining}>Join</button>
        </div>
      )}
      {r && <RatingCard r={r} />}
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
