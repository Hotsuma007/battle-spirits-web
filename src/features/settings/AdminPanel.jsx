import { japaneseText as ___bsJa } from "../../localization/displayLanguage.js";
import { useEffect, useMemo, useState } from "react";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import { useLanguage } from "../../localization/i18n.jsx";
import {
  adjustAdminCurrency,
  getAdminAccess,
  listAdminPlayers,
  setAdminPlayerStatus
} from "./services/adminService.js";
import "../../styles/pages/adminPanel.css";

export default function AdminPanel({ onBack }) {
  const { language } = useLanguage();
  const pt = language !== "en";
  const [access, setAccess] = useState("checking");
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currency, setCurrency] = useState("spirit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const selected = useMemo(() => players.find((row) => row.user_id === selectedId) || players[0] || null, [players, selectedId]);

  async function refresh(search = query) {
    const result = await listAdminPlayers(search);
    if (!result.ok) {
      setNotice(language === "ja" ? "アカウントを読み込めませんでした。" : pt ? "Não foi possível carregar as contas." : "Could not load accounts.");
      return;
    }
    setPlayers(result.rows);
    if (result.rows.length && !result.rows.some((row) => row.user_id === selectedId)) setSelectedId(result.rows[0].user_id);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getAdminAccess();
      if (!active) return;
      setAccess(result.allowed ? "allowed" : "denied");
      if (result.allowed) {
        const list = await listAdminPlayers("");
        if (!active) return;
        setPlayers(list.rows || []);
        if (list.rows?.[0]) setSelectedId(list.rows[0].user_id);
      }
    })();
    return () => { active = false; };
  }, []);

  async function applyCurrency() {
    if (!selected || !amount || Number(amount) === 0) return;
    setBusy(true); setNotice("");
    const result = await adjustAdminCurrency(selected.user_id, currency, Number(amount), reason);
    setBusy(false);
    if (!result.ok) {
      setNotice(language === "ja" ? "変更を適用できませんでした。" : pt ? "A alteração não pôde ser aplicada." : "The change could not be applied.");
      return;
    }
    setAmount(""); setReason("");
    setNotice(language === "ja" ? "通貨情報を更新しました。" : pt ? "Economia atualizada." : "Economy updated.");
    await refresh();
  }

  async function changeStatus(nextStatus) {
    if (!selected) return;
    setBusy(true); setNotice("");
    const result = await setAdminPlayerStatus(selected.user_id, nextStatus);
    setBusy(false);
    if (!result.ok) setNotice(language === "ja" ? "状態を更新できませんでした。" : pt ? "Não foi possível atualizar o status." : "Could not update status.");
    else {
      setNotice(language === "ja" ? "状態を更新しました。" : pt ? "Status atualizado." : "Status updated.");
      await refresh();
    }
  }

  return (
    <main className="admin-panel-page">
      <EternalCinematicBackdrop compact />
      <div className="admin-panel-shade" aria-hidden="true" />
      <header className="admin-panel-topbar">
        <button type="button" onClick={onBack}>{pt ? ___bsJa("Voltar", "戻る") : ___bsJa("Back", "戻る")}</button>
        <div><span>{___bsJa("BATTLE SPIRITS ETERNAL", "バトルスピリッツエターナル")}</span><h1>{___bsJa("ADMIN PANEL", "管理パネル")}</h1></div>
        <b>{pt ? ___bsJa("Gameplay & Economia", "ゲームプレイと経済性") : ___bsJa("Gameplay & Economy", "ゲームプレイと経済性")}</b>
      </header>

      {access === "checking" && <section className="admin-panel-state">{pt ? ___bsJa("Verificando acesso…", "アクセスを確認中…") : ___bsJa("Checking access…", "アクセスを確認中…")}</section>}
      {access === "denied" && (
        <section className="admin-panel-state">
          <strong>{pt ? ___bsJa("Acesso administrativo não autorizado", "管理アクセスが許可されていません") : ___bsJa("Administrative access not authorized", "管理アクセスが許可されていません")}</strong>
          <p>{pt ? ___bsJa("Este painel só fica disponível para contas com permissão administrativa.", "このパネルは、管理者権限を持つアカウントのみが使用できます。") : ___bsJa("This panel is only available to accounts with administrative permission.", "このパネルは、管理者権限を持つアカウントのみが使用できます。")}</p>
        </section>
      )}
      {access === "allowed" && (
        <section className="admin-panel-shell">
          <aside className="admin-player-list">
            <form onSubmit={(event) => { event.preventDefault(); refresh(query); }}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={pt ? ___bsJa("Buscar jogador…", "プレーヤーを検索…") : ___bsJa("Search player…", "プレーヤーを検索…")} />
              <button type="submit" aria-label={pt ? ___bsJa("Buscar", "検索") : ___bsJa("Search", "検索")}>⌕</button>
            </form>
            <div>
              {players.map((player) => (
                <button type="button" key={player.user_id} className={selected?.user_id === player.user_id ? "active" : ""} onClick={() => setSelectedId(player.user_id)}>
                  <span><strong>{player.display_name || ___bsJa("Player", "プレイヤー")}</strong><small>@{player.username || ___bsJa("user", "ユーザー")}</small></span>
                  <em>{player.account_status || ___bsJa("active", "アクティブ")}</em>
                </button>
              ))}
            </div>
          </aside>

          <div className="admin-player-editor">
            {selected ? <>
              <header>
                <div><span>{pt ? ___bsJa("CONTA SELECIONADA", "選択したアカウント") : ___bsJa("SELECTED ACCOUNT", "選択したアカウント")}</span><h2>{selected.display_name || ___bsJa("Player", "プレイヤー")}</h2><small>@{selected.username}</small></div>
                <span className={`admin-status status-${selected.account_status || "active"}`}>{selected.account_status || ___bsJa("active", "アクティブ")}</span>
              </header>

              <div className="admin-wallet-grid">
                <article><span>SC</span><div><small>{___bsJa("Spirit Coins", "スピリットコイン")}</small><strong>{Number(selected.spirit_coins || 0).toLocaleString("pt-BR")}</strong></div></article>
                <article><span>CC</span><div><small>{___bsJa("Craft Coins", "クラフトコイン")}</small><strong>{Number(selected.craft_coins || 0).toLocaleString("pt-BR")}</strong></div></article>
              </div>

              <section className="admin-editor-card">
                <div><span>{pt ? ___bsJa("AJUSTE DE ECONOMIA", "経済の調整") : ___bsJa("ECONOMY ADJUSTMENT", "経済の調整")}</span><h3>{pt ? ___bsJa("Adicionar ou deduzir Coins", "コインを追加または削除する") : ___bsJa("Add or deduct Coins", "コインを追加または削除する")}</h3></div>
                <div className="admin-form-grid">
                  <label><span>{pt ? ___bsJa("Moeda", "通貨") : ___bsJa("Currency", "通貨")}</span><select value={currency} onChange={(e) => setCurrency(e.target.value)}><option value="spirit">{___bsJa("Spirit Coins", "スピリットコイン")}</option><option value="craft">{___bsJa("Craft Coins", "クラフトコイン")}</option></select></label>
                  <label><span>{pt ? ___bsJa("Quantidade", "額") : ___bsJa("Amount", "額")}</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-500 / 1500" /></label>
                </div>
                <label><span>{pt ? ___bsJa("Motivo interno", "内部的な理由") : ___bsJa("Internal reason", "内部的な理由")}</span><input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={240} /></label>
                <button type="button" className="admin-primary" disabled={busy || !amount || Number(amount) === 0} onClick={applyCurrency}>{pt ? ___bsJa("Aplicar alteração", "変更を適用する") : ___bsJa("Apply change", "変更を適用する")}</button>
              </section>

              <section className="admin-editor-card">
                <div><span>{pt ? ___bsJa("STATUS DE GAMEPLAY", "ゲームプレイステータス") : ___bsJa("GAMEPLAY STATUS", "ゲームプレイステータス")}</span><h3>{pt ? ___bsJa("Gerenciar estado da conta", "アカウントの状態を管理する") : ___bsJa("Manage account state", "アカウントの状態を管理する")}</h3></div>
                <div className="admin-status-actions">
                  <button type="button" onClick={() => changeStatus("active")} disabled={busy}>{___bsJa("Active", "アクティブ")}</button>
                  <button type="button" onClick={() => changeStatus("restricted")} disabled={busy}>{___bsJa("Restricted", "制限付き")}</button>
                  <button type="button" onClick={() => changeStatus("suspended")} disabled={busy}>{___bsJa("Suspended", "一時停止中")}</button>
                </div>
              </section>

              <p className="admin-privacy-note">{pt ? ___bsJa("O Admin Panel não exibe senhas, tokens, e-mails privados ou outros dados sensíveis. Somente identidade pública, estado de gameplay e economia.", "管理者パネルは、パスワード、トークン、プライベートメール、その他の機密データを公開しません。パブリック ID、ゲームプレイ ステータス、経済のみが利用可能です。") : ___bsJa("The Admin Panel does not expose passwords, tokens, private emails or other sensitive data. Only public identity, gameplay status and economy are available.", "管理者パネルは、パスワード、トークン、プライベートメール、その他の機密データを公開しません。パブリック ID、ゲームプレイ ステータス、経済のみが利用可能です。")}</p>
              {notice && <div className="admin-notice">{notice}</div>}
            </> : <div className="admin-empty">{pt ? ___bsJa("Nenhum jogador encontrado.", "プレーヤーが見つかりませんでした。") : ___bsJa("No players found.", "プレーヤーが見つかりませんでした。")}</div>}
          </div>
        </section>
      )}
    </main>
  );
}
