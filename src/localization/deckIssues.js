import { getCardName } from "../game/cardAdapter.js";

export function japaneseDeckIssue(issue, cardIndex) {
  const card = issue.cardId ? cardIndex?.get?.(issue.cardId) : null;
  const name = card ? getCardName(card, "ja") : issue.cardId || "カード";
  switch (issue.code) {
    case "minimum_deck_size": return `デッキは${issue.minimum}枚以上必要です。`;
    case "card_unavailable": return `${issue.cardId}はこのバージョンでは使用できません。`;
    case "token_in_deck": return `${name}はトークンのため、デッキに入れられません。`;
    case "eternal_banned": return `${name}は現在のエターナルで禁止されています。`;
    case "official_copy_limit": return `${name}は現在の公式ルールでは${issue.limit}枚までです。`;
    case "same_name_limit": return `${name}と同じ名前のカードは${issue.limit}枚までです。`;
    case "multiple_contract_types": return "契約カードは1種類だけ入れられます。";
    case "official_banned_pair": return "現在の公式ルールでは一緒に使用できないカードの組み合わせが含まれています。";
    case "large_deck": return "枚数の多いデッキは対戦が長くなる場合があります。";
    default: return issue.message || "デッキを確認してください。";
  }
}
