import test from "node:test";
import assert from "node:assert/strict";
import { io } from "socket.io-client";
import { createBattleSpiritsServer } from "./index.mjs";
import { PREBUILT_DECKS } from "../src/data/decks/prebuilt-decks.js";

test("two clients can create and join a room and start a match", async (t) => {
  const instance = await createBattleSpiritsServer({ port: 0, host: "127.0.0.1" });
  const address = instance.server.address();
  const sockets = [0, 1].map(() => io(`http://127.0.0.1:${address.port}`, {
    transports: ["websocket"],
    timeout: 3000
  }));
  t.after(async () => {
    sockets.forEach((socket) => socket.disconnect());
    await instance.stop();
  });

  await Promise.all(sockets.map((socket) => new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  })));
  const deck = PREBUILT_DECKS.find((item) => item.setCode === "SD10").cards;
  const created = await sockets[0].timeout(3000).emitWithAck("room:create", { profile: { name: "検証者1" }, deck });
  assert.equal(created.ok, true, created.error);
  assert.equal(created.state.matchHistoryRecord, null);
  const joined = await sockets[1].timeout(3000).emitWithAck("room:join", { code: created.code, profile: { name: "検証者2" }, deck });
  assert.equal(joined.ok, true, joined.error);
  const started = await sockets[0].timeout(3000).emitWithAck("room:start", {});
  assert.equal(started.ok, true, started.error);
  const match = instance.rooms.get(created.code).match;
  assert.equal(match.players.player1.hand.length, 4);
  assert.equal(match.players.player2.hand.length, 4);
  assert.equal(instance.matchRegistry.size, 1);
  assert.equal(instance.cardIndex.get("SD11-006").abilities.length, 1);
});
