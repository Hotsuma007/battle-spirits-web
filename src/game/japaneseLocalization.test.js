import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCardCatalog } from "./cardCatalog.js";
import { getCardName, makeCardIndex } from "./cardAdapter.js";
import { eternalDeckNameKey } from "./eternalDeckRules.js";
import { getJapaneseCardText, getJapaneseFamily } from "../localization/cardText.js";
import { getDisplayCardName } from "../localization/displayCardName.js";
import { setDisplayLanguage } from "../localization/displayLanguage.js";
import { japaneseGameLog, japanesePhase } from "../localization/gameLog.js";
import { japaneseDeckIssue } from "../localization/deckIssues.js";

function catalog() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".json")) files.push(file);
    }
  };
  walk(fileURLToPath(new URL("../data/", import.meta.url)));
  return buildCardCatalog(files.map((file) => [file, JSON.parse(fs.readFileSync(file, "utf8"))]));
}

test("all catalog cards have Japanese display names and translated existing effect text", () => {
  const index = catalog();
  assert.ok(index.size > 1000);
  for (const card of index.values()) {
    assert.match(getCardName(card, "ja"), /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u, card.id);
    const text = typeof card.effectText === "string" ? card.effectText : card.effectText?.en;
    if (text) assert.notEqual(getJapaneseCardText(card.effectText), text, `${card.id} has untranslated effect text`);
    for (const effect of card.effects || []) {
      for (const key of ["title", "text", "description"]) {
        const source = typeof effect[key] === "string" ? effect[key] : effect[key]?.en;
        if (source && /[A-Za-z]{3}/.test(source)) assert.notEqual(getJapaneseCardText(effect[key]), source, `${card.id} ${key}`);
      }
    }
  }
  assert.equal(getJapaneseFamily("Astral Dragon"), "星竜");
});

test("Japanese display selection does not change same-name deck validation keys", () => {
  const card = { id: "T-1", nameEN: "Different Name", namePT: "Mesmo Nome", nameJP: "日本語の名前" };
  setDisplayLanguage("ja");
  assert.equal(getDisplayCardName(card), "日本語の名前");
  assert.equal(eternalDeckNameKey(card), "mesmo nome");
  setDisplayLanguage("en");
  assert.equal(getDisplayCardName(card), "Different Name");
  assert.equal(eternalDeckNameKey(card), "mesmo nome");
  setDisplayLanguage("ja");
});

test("timing and strict BP comparisons remain visible in Japanese effect text", () => {
  const either = "LV1/LV2 During Either Attack Step: When a Spirit with 2 or fewer cores on it attacks, destroy that Spirit. LV2 During Your Draw Step: At the start of the step, by discarding 1 Spirit card with [Curse] or [Immortality] from your hand, increase the number of cards you draw by 2.";
  assert.match(getJapaneseCardText(either), /お互いのアタックステップ/);
  const lower = "LV2 During the Opponent's Attack Step: This Spirit cannot block Spirits with BP lower than this Spirit's BP.";
  assert.match(getJapaneseCardText(lower), /未満/);
});

test("game log and validation messages localize without changing player names", () => {
  const index = makeCardIndex([{ id: "T-1", nameEN: "Light-Bladra", namePT: "Light-Bladra", nameJP: "ライト・ブレイドラ" }]);
  assert.equal(japaneseGameLog("ほつま invocou Light-Bladra.", index), "ほつまがライト・ブレイドラを召喚しました。");
  assert.equal(japaneseGameLog("Turno 2: ほつま.", index), "ターン2：ほつま");
  assert.equal(japanesePhase("attack"), "アタック");
  assert.match(japaneseDeckIssue({ code: "same_name_limit", limit: 3, cardId: "T-1" }, index), /ライト・ブレイドラ.*3枚/);
});

test("battle errors preserve quantities, game terms and player actions", async () => {
  const { japaneseGameError } = await import("../localization/japaneseGameErrors.js");
  assert.equal(japaneseGameError("Pagamento incorreto: esperado 3, recebido 1."), "支払うコアの数が違います。必要数は3個、支払った数は1個です。");
  assert.equal(japaneseGameError("A Summoning Condition exige pelo menos 1 Spirit red."), "召喚条件には赤のスピリットが1体以上必要です。");
  assert.match(japaneseGameError("Bloqueio indisponível."), /ブロック/);
  assert.match(japaneseGameError("Reserve insuficiente para o pagamento escolhido."), /リザーブのコアが足りません/);
  assert.equal(japaneseGameError("unrecognized error"), "unrecognized error");
});

test("trigger and manual-action logs are translated without altering the stored event", () => {
  const index = makeCardIndex([{ id: "T-1", nameEN: "Light-Bladra", namePT: "Light-Bladra", nameJP: "ライト・ブレイドラ" }]);
  const source = "U-Trigger: Light-Bladra (Cost 3) — HIT.";
  assert.equal(japaneseGameLog(source, index), "Uトリガー：ライト・ブレイドラ（コスト3）・ヒット。");
  assert.equal(source, "U-Trigger: Light-Bladra (Cost 3) — HIT.");
  assert.equal(japaneseGameLog("Resolução manual: voidToReserve."), "手動処理：ボイドからリザーブへコアを移動。");
});

test("Japanese card text keeps meaningful conditions and game terminology", () => {
  assert.match(getJapaneseCardText("LV1 When This Brave Is Summoned: The opponent exhausts 2 of their Spirits. Combine Condition: Cost 4 or more."), /相手は自分のスピリット2体を疲労/);
  assert.match(getJapaneseCardText("Treat this Spirit's color as colorless, then put one core from every opposing Spirit/Ultimate into the opponent's Trash. If none are depleted, draw up to two cards."), /消滅した.*いなければ/);
});

test("historical update notes and card choice labels have Japanese display text", async () => {
  const { japanesePatchNotes } = await import("../localization/japanesePatchNotes.js");
  const { getJapaneseDecisionText } = await import("../localization/cardText.js");
  assert.ok(Object.keys(japanesePatchNotes).length >= 400);
  assert.match(japanesePatchNotes["v5.1.0 — Card Automation Complete"], /カード自動化/);
  assert.equal(getJapaneseDecisionText("Main"), "メイン");
  assert.equal(getJapaneseDecisionText("Choose 1 exhausted opposing Spirit that is not Braved."), "疲労状態で合体していない相手のスピリット1体を選ぶ。");
});
