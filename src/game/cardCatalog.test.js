import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCardCatalog } from "./cardCatalog.js";

test("audited abilities survive a duplicate set catalog while the set artwork is retained", () => {
  const runtime = JSON.parse(fs.readFileSync(new URL("../data/cards.json", import.meta.url), "utf8"));
  const set = JSON.parse(fs.readFileSync(new URL("../data/SD11.json", import.meta.url), "utf8"));
  const catalog = buildCardCatalog([["cards.json", runtime], ["SD11.json", set]]);

  assert.deepEqual(catalog.get("SD11-006").abilities.map((ability) => ability.id), ["sd11-006-opponent-attack-auto"]);
  assert.deepEqual(catalog.get("SD11-004").abilities.map((ability) => ability.id), ["sd11-004-block-bp", "sd11-004-exhausted-block-auto"]);
  assert.equal(catalog.get("SD11-006").image, set.find((card) => card.id === "SD11-006").image);
});

test("a set-only card remains available alongside the runtime catalog", () => {
  const catalog = buildCardCatalog([
    ["cards.json", [{ id: "RUN-001", name: "Runtime" }]],
    ["set.json", { cards: [{ id: "SET-001", name: "Set only" }] }]
  ]);
  assert.equal(catalog.get("SET-001").name, "Set only");
  assert.equal(catalog.get("RUN-001").name, "Runtime");
});
