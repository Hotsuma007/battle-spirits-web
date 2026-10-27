import { japaneseCardFamilies } from "./japaneseCardNames.js";
import { japaneseCardTexts } from "./japaneseCardTexts.js";
import { japaneseDecisionTexts } from "./japaneseDecisionTexts.js";

const keywords = {
  Charge: "強化", Curse: "呪撃", Awaken: "覚醒", Rush: "連鎖", Chain: "連鎖",
  Flash: "フラッシュ", Burst: "バースト", Main: "メイン", Brave: "ブレイヴ",
  Immortality: "不死", "High Speed": "神速", Armor: "装甲", Confront: "激突", Crush: "粉砕"
};

// Preserve the original catalog data and structured effect definitions. These
// helpers translate presentation only; unknown text is left intact so that no
// information is silently dropped when new cards are added.
export function getJapaneseCardText(value) {
  if (!value) return "";
  if (typeof value === "object") {
    if (value.ja) return value.ja;
    value = value.en || value.ptBR || value.pt || "";
  }
  return keywords[value] || japaneseCardTexts[value] || value;
}

export function getJapaneseFamily(value) {
  return japaneseCardFamilies[value] || value;
}

export function getJapaneseDecisionText(value) {
  return japaneseDecisionTexts[value] || getJapaneseCardText(value);
}
