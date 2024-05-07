// This file defines the ClientState entity that we use to track
// cursors. It also defines some basic CRUD functions using the
// @rocicorp/rails helper library.

import type { WriteTransaction } from "@rocicorp/reflect";
import { Entity, generate } from "@rocicorp/rails";
import { randUserInfo, UserInfo } from "./user";
import { Rating } from "./rating";

export type ClientState = Entity & {
  ratings: Rating[];
  userInfo: UserInfo;
};

export { initClientState, getClientState, putClientState, updateClientState };

const {
  init: setClientState,
  get: getClientState,
  put: putClientState,
  update: updateClientState,
} = generate<ClientState>("client-state");

async function initClientState(tx: WriteTransaction, userID: string) {
  const userInfo = randUserInfo(userID);

  return setClientState(tx, {
    id: tx.clientID,
    ratings: [],
    userInfo,
  });
}
