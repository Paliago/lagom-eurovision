// This file defines our "subscriptions". Subscriptions are how Reflect
// notifies you when data has changed. Subscriptions fire whenever the watched
// data changes, whether because the local client changed it, or because some
// other collaborating client changed it. The model is that you render your app
// reactively based on these subscriptions. This guarantees the UI always
// consistently shows the latest data.
//
// Subscriptions can be arbitrary computations of the data in Reflect. The
// subscription "query" is re-run whenever any of the data it depends on
// changes. The subscription "fires" when the result of the query changes.

import type { Reflect } from "@rocicorp/reflect/client";
import { useSubscribe } from "@rocicorp/reflect/react";
import { getClientState } from "./client-state.js";
import type { M } from "./mutators.js";
import { buildId, getRating, listRatings } from "./rating.js";

export function useCount(reflect: Reflect<M>) {
  return useSubscribe(reflect, (tx) => tx.get<number>("count"), 0);
}

export function useClientState(r: Reflect<M>, id: string) {
  return useSubscribe(r, (tx) => getClientState(tx, id), null);
}

export function useRating(
  reflect: Reflect<M>,
  { songNumber, userID }: { songNumber: number; userID: string },
) {
  const id = buildId(songNumber, userID);
  return useSubscribe(reflect, (tx) => getRating(tx, id), null, [id]);
}

export function useRatings(reflect: Reflect<M>) {
  return useSubscribe(reflect, (tx) => listRatings(tx), null);
}
