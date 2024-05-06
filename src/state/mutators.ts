// This file defines our "mutators".
//
// Mutators are how you change data in Reflect apps.
//
// They are registered with Reflect at construction-time and callable like:
// `myReflect.mutate.setCursor()`.
//
// Reflect runs each mutation immediately (optimistically) on the client,
// against the local cache, and then later (usually moments later) sends a
// description of the mutation (its name and arguments) to the server, so that
// the server can *re-run* the mutation there against the authoritative
// datastore.
//
// This re-running of mutations is how Reflect handles conflicts: the
// mutators defensively check the database when they run and do the appropriate
// thing. The Reflect sync protocol ensures that the server-side result takes
// precedence over the client-side optimistic result.

import type { MutatorDefs, WriteTransaction } from "@rocicorp/reflect";
import {
  getClientState,
  initClientState,
  Rating,
  updateClientState,
} from "./client-state.js";

export const mutators = {
  initClientState,
  increment,
  setRating,
} satisfies MutatorDefs;

export type M = typeof mutators;

async function increment(
  tx: WriteTransaction,
  { key, delta }: { key: string; delta: number },
) {
  const prev = await tx.get<number>(key);
  const next = (prev ?? 0) + delta;
  await tx.set(key, next);
}

async function setRating(tx: WriteTransaction, rating: Rating): Promise<void> {
  const prev = await getClientState(tx, tx.clientID);
  let ratings = prev?.ratings || [];

  const existingIndex = ratings.findIndex(
    (r) => r.songIndex === rating.songIndex,
  );

  if (existingIndex > -1) {
    ratings[existingIndex] = rating;
  } else {
    ratings.push(rating);
  }

  await updateClientState(tx, { id: tx.clientID, ratings });
}
