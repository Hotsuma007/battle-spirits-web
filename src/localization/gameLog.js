import { getCardName } from "../game/cardAdapter.js";

const phases = { start: "スタート", core: "コア", draw: "ドロー", refresh: "リフレッシュ", main: "メイン", attack: "アタック", end: "エンド" };
const events = {
  whenSummoned: "召喚時", whenDeployed: "配置時", whenAttacks: "アタック時", whenBlocks: "ブロック時",
  whenDestroyed: "破壊時", whenBraved: "合体時", whenCombined: "合体時", continuous: "常時", flash: "フラッシュ"
};
const indexes = new WeakMap();

export function japanesePhase(phase) {
  return phases[String(phase || "").toLowerCase()] || phase || "";
}

function japaneseCardName(name, cardIndex) {
  if (!cardIndex || typeof cardIndex.values !== "function") return name;
  let names = indexes.get(cardIndex);
  if (!names) {
    names = new Map();
    for (const card of cardIndex.values()) {
      const ja = getCardName(card, "ja");
      for (const original of [card.id, card.name, card.nameEN, card.namePT]) {
        if (original && ja && !names.has(original)) names.set(original, ja);
      }
    }
    indexes.set(cardIndex, names);
  }
  return names.get(name) || name;
}

export function japaneseGameLog(text, cardIndex) {
  const value = String(text || "");
  if (value === "Partida iniciada.") return "対戦を開始しました。";
  const triggerName = (name) => name === "XU Trigger" ? "XUトリガー" : "Uトリガー";
  let trigger;
  if ((trigger = value.match(/^(XU Trigger|U-Trigger): o deck do oponente estava vazio; nenhuma carta foi revelada\.$/))) return `${triggerName(trigger[1])}：相手のデッキが空のため、カードは公開されませんでした。`;
  if ((trigger = value.match(/^(XU Trigger|U-Trigger): (.+) \(Cost (\d+)\) — (HIT|GUARD)\.$/))) return `${triggerName(trigger[1])}：${japaneseCardName(trigger[2], cardIndex)}（コスト${trigger[3]}）・${trigger[4] === "HIT" ? "ヒット" : "ガード"}。`;
  if ((trigger = value.match(/^(XU Trigger|U-Trigger): a fonte não está mais no campo; o efeito de HIT não foi ativado\.$/))) return `${triggerName(trigger[1])}：発揮元がフィールドを離れたため、ヒット時効果は発揮しませんでした。`;
  if ((trigger = value.match(/^Resolução manual: (\w+)\.$/))) {
    const actions = { draw: "ドロー", adjustLife: "ライフを調整", temporaryBP: "BPを一時的に変更", refresh: "回復", exhaust: "疲労", destroy: "破壊", returnHand: "手札に戻す", moveCard: "カードを移動", topDeckToTrash: "デッキの上からトラッシュへ移動", voidToReserve: "ボイドからリザーブへコアを移動", revealTop: "デッキの上を公開", revealedToHand: "公開したカードを手札に移動", revealedToTop: "公開したカードをデッキの上に戻す", revealedToBottom: "公開したカードをデッキの下に戻す" };
    return `手動処理：${actions[trigger[1]] || trigger[1]}。`;
  }
  let m;
  if ((m = value.match(/^Turno (\d+): (.+)\.$/))) return `ターン${m[1]}：${m[2]}`;
  if ((m = value.match(/^(.+): (start|core|draw|refresh|main|attack|end)\.$/i))) return `${m[1]}：${japanesePhase(m[2])}ステップ`;
  if ((m = value.match(/^(.+): end \(efeito encerrou o Attack Step\)\.$/))) return `${m[1]}：効果によりアタックステップが終了しました。`;
  if ((m = value.match(/^(.+) declarou um ataque\.$/))) return `${m[1]}がアタックを宣言しました。`;
  if ((m = value.match(/^(\d+) Life foi reduzida pelo ataque não bloqueado\.$/))) return `ブロックされなかったアタックでライフが${m[1]}減りました。`;
  if ((m = value.match(/^Battle Resolution: (\d+) BP × (\d+) BP\.$/))) return `バトル解決：${m[1]} BP 対 ${m[2]} BP。`;
  if ((m = value.match(/^(.+) invocou (.+?) em Direct Combine\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}を直接合体で召喚しました。`;
  if ((m = value.match(/^(.+) invocou (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}を召喚しました。`;
  if ((m = value.match(/^(.+) colocou (.+?) (em Direct Combine|no campo) e iniciou o pagamento manual\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}を${m[3] === "no campo" ? "フィールドに置き" : "直接合体し"}、コストの支払いを始めました。`;
  if ((m = value.match(/^(.+) colocou (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}を配置しました。`;
  if ((m = value.match(/^(.+) iniciou pagamento manual de (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}のコストの支払いを始めました。`;
  if ((m = value.match(/^(.+) confirmou (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}の使用を確定しました。`;
  if ((m = value.match(/^(.+) cancelou a jogada de (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}の使用を取り消しました。`;
  if ((m = value.match(/^(.+) usou (.+) como Trigger Counter\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}をトリガーカウンターとして使いました。`;
  if ((m = value.match(/^(.+) usou (.+) \((main|flash)\)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}の${m[3] === "main" ? "メイン" : "フラッシュ"}効果を使いました。`;
  if ((m = value.match(/^(.+) setou uma (Burst|Mirage)\.$/))) return `${m[1]}が${m[2] === "Burst" ? "バースト" : "ミラージュ"}をセットしました。`;
  if ((m = value.match(/^(.+) ativou (.+)\.$/))) return `${m[1]}が${japaneseCardName(m[2], cardIndex)}を発動しました。`;
  if ((m = value.match(/^(.+) não usou Trigger Counter\.$/))) return `${m[1]}はトリガーカウンターを使いませんでした。`;
  if ((m = value.match(/^(.+) sofreu Depletion e foi ao Trash\.$/))) return `${japaneseCardName(m[1], cardIndex)}はコア不足によりトラッシュに置かれました。`;
  if ((m = value.match(/^(.+) foi combinado( \(condição confirmada manualmente\))?\.$/))) return `${japaneseCardName(m[1], cardIndex)}が合体しました。${m[2] ? "（合体条件を手動で確認）" : ""}`;
  if ((m = value.match(/^(.+) trocou de alvo combinado\.$/))) return `${japaneseCardName(m[1], cardIndex)}の合体先を変更しました。`;
  if ((m = value.match(/^(.+) foi separado automaticamente porque a condição de Combine deixou de ser válida\.$/))) return `${japaneseCardName(m[1], cardIndex)}は合体条件を満たさなくなったため、自動的に分離しました。`;
  if ((m = value.match(/^(.+) foi separado\.$/))) return `${japaneseCardName(m[1], cardIndex)}が分離しました。`;
  if ((m = value.match(/^(.+): (\d+) efeito\(s\) resolvido\(s\) automaticamente em (.+)\.$/))) return `${japaneseCardName(m[1], cardIndex)}：${events[m[3]] || m[3]}の効果${m[2]}件を自動で解決しました。`;
  if ((m = value.match(/^(.+): decisão de efeito resolvida\.$/))) return `${japaneseCardName(m[1], cardIndex)}：効果の選択を解決しました。`;
  if ((m = value.match(/^(.+): resolução de Magic concluída\.$/))) return `${japaneseCardName(m[1], cardIndex)}：マジックの解決が完了しました。`;
  if (value === "O Brave deixou de cumprir a condição de Combine e, sem Cores para manter LV1, foi ao Trash.") return "ブレイヴは合体条件を満たさず、Lv1を維持するコアもないためトラッシュに置かれました。";
  if (value === "O Brave foi separado sem Cores suficientes para LV1 e foi ao Trash.") return "ブレイヴは分離時にLv1を維持するコアが足りず、トラッシュに置かれました。";
  return value;
}
