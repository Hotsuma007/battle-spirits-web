// The language provider updates this before rendering its children. Keeping the
// display language here lets shared, non-React presentation helpers use the
// same choice without changing game identifiers or saved data.
let currentLanguage = "ja";

export function setDisplayLanguage(language) {
  currentLanguage = ["ja", "en", "ptBR"].includes(language) ? language : "ja";
}

export function getDisplayLanguage() {
  return currentLanguage;
}

export function isJapaneseDisplay() {
  return currentLanguage === "ja";
}

export function japaneseText(original, japanese) {
  return isJapaneseDisplay() ? japanese : original;
}
