import { makeCardIndex, normalizeCard } from "./cardAdapter.js";

function isRuntimeCatalog(path) {
  return /(?:^|\/)cards\.json$/i.test(String(path).replaceAll("\\", "/"));
}

// cards.json contains the audited runtime effects. Other catalogs supply
// additional cards and artwork, but must not replace those effects.
export function buildCardCatalog(sources) {
  const ordered = [...sources].sort(([a], [b]) => {
    const aRuntime = isRuntimeCatalog(a);
    const bRuntime = isRuntimeCatalog(b);
    if (aRuntime !== bRuntime) return aRuntime ? 1 : -1;
    return String(a).localeCompare(String(b));
  });
  const byId = new Map();

  for (const [path, rawModule] of ordered) {
    const list = Array.isArray(rawModule) ? rawModule : (Array.isArray(rawModule?.cards) ? rawModule.cards : []);
    for (const raw of list) {
      const card = normalizeCard(raw);
      if (!card.id || card.id === "unknown") continue;
      const previous = byId.get(card.id);
      if (!previous) {
        byId.set(card.id, card);
        continue;
      }
      byId.set(card.id, {
        ...previous,
        ...card,
        image: isRuntimeCatalog(path)
          ? previous.image || card.image || null
          : card.image || previous.image || null
      });
    }
  }

  return makeCardIndex([...byId.values()]);
}
