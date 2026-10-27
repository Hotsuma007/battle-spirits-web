import { getCardName } from "../game/cardAdapter.js";
import { getDisplayLanguage } from "./displayLanguage.js";

// The rules engine deliberately keeps its original name normalization.
export function getDisplayCardName(card, language = getDisplayLanguage()) {
  return getCardName(card, language);
}
