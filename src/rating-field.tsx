import { Reflect } from "@rocicorp/reflect/client";
import { useEffect } from "react";
import { M } from "./mutators.js";
import { useClientState, useRating } from "./subscriptions.js";

export default function RatingField({
  r,
  userID,
}: {
  r: Reflect<M>;
  userID: string;
}) {
  useEffect(() => {
    const handler = (evt: any) => {
      let score = Number(evt.target.value);

      void r.mutate.setRating({ rating: score });
    };

    window.addEventListener("input", handler);
    return () => window.removeEventListener("input", handler);
  }, []);

  const rating = useRating(r, "rating");

  const cs = useClientState(r, r.clientID);

  const { userInfo } = cs || {
    userInfo: { name: "unknown" },
  };

  return (
    <>
      <p>
        {userInfo.name}'s rating: {rating}
      </p>
      <input type="number" defaultValue={rating} />
    </>
  );
}
