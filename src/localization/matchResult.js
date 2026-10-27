export function japaneseResultReason(reason, defeatedName) {
  const name = defeatedName || "相手";
  if (reason === "life") return { title: "ライフが0になりました", text: `${name}のライフがなくなりました。` };
  if (reason === "deck") return { title: "デッキがなくなりました", text: `${name}のデッキがなくなりました。` };
  if (reason === "turn_timeout") return { title: "制限時間切れ", text: `${name}のターンの制限時間が切れました。` };
  if (reason === "disconnect_timeout") return { title: "再接続の制限時間切れ", text: `${name}は制限時間内に再接続できませんでした。` };
  if (reason === "concede" || reason === "surrender") return { title: "投了", text: `${name}が投了しました。` };
  return { title: "勝利条件を達成", text: "対戦の勝利条件を達成しました。" };
}
