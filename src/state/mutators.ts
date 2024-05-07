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
import { initClientState } from "./client-state.js";
import { buildId, putRating, Rating } from "./rating.js";

export const mutators = {
  initClientState,
  increment,
  setRating,
} satisfies MutatorDefs;

export type M = typeof mutators;

async function increment(tx: WriteTransaction, { delta }: { delta: number }) {
  const prev = await tx.get<number>("count");
  const next = (prev ?? 0) + delta;
  await tx.set("count", next);
}

async function setRating(
  tx: WriteTransaction,
  { userID, rating }: { userID: string; rating: Rating },
) {
  await putRating(tx, { id: buildId(rating.number, userID), ...rating });
}
