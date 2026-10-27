import { japaneseText as ___bsJa } from "../../localization/displayLanguage.js";
import EternalCinematicBackdrop from "../../components/layout/EternalCinematicBackdrop.jsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getProfile
} from "../../services/platform/storage.js";

import {
  accountsEnabled,
  supabase
} from "../../services/platform/supabase.js";

import {
  getAccountSession,
  loadCloudProfile,
  loadDecksFromCloud,
  signIn,
  signOut,
  signUp,
  syncDecksToCloud,
  syncProfileToCloud
} from "../../services/player/socialService.js";

import {
  useLanguage
} from "../../localization/i18n.jsx";

import "../../styles/pages/account.css";
import "../../styles/pages/eternalInterfaceV350.css";


function getInitials(value) {
  const parts =
    String(
      value ||
      "Battle Spirits"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return "BS";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}


function SyncAction({
  eyebrow,
  title,
  description,
  icon,
  disabled,
  onClick
}) {
  return (
    <button
      type="button"
      className="account-sync-action"
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className="account-sync-icon"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="account-sync-copy">
        <small>
          {eyebrow}
        </small>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </span>

      <b aria-hidden="true">
        →
      </b>
    </button>
  );
}


export default function Account({
  onBack,
  onProfile
}) {
  const {
    language
  } =
    useLanguage();

  const pt =
    language !== "en";

  const localProfile =
    useMemo(
      () =>
        getProfile() ||
        {},
      []
    );

  const [
    session,
    setSession
  ] =
    useState({
      mode:
        accountsEnabled
          ? "cloud"
          : "local",

      user:
        null
    });

  const [
    email,
    setEmail
  ] =
    useState("");

  const [
    password,
    setPassword
  ] =
    useState("");

  const [
    message,
    setMessage
  ] =
    useState("");

  const [
    loading,
    setLoading
  ] =
    useState(
      Boolean(
        accountsEnabled
      )
    );


  const refresh =
    useCallback(
      async () => {
        try {
          const next =
            await getAccountSession();

          setSession(
            next || {
              mode:
                accountsEnabled
                  ? "cloud"
                  : "local",

              user:
                null
            }
          );
        } catch (
          error
        ) {
          console.error(
            "Falha ao atualizar sessão:",
            error
          );

          setMessage(
            language === "ja" ? "現在、アカウント情報を読み込めません。" : pt
              ? "Não foi possível carregar sua conta agora."
              : "Could not load your account right now."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        pt
      ]
    );


  useEffect(() => {
    let active =
      true;

    (async () => {
      try {
        const next =
          await getAccountSession();

        if (active) {
          setSession(
            next || {
              mode:
                accountsEnabled
                  ? "cloud"
                  : "local",

              user:
                null
            }
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Falha ao carregar sessão:",
          error
        );

        if (active) {
          setMessage(
            language === "ja" ? "現在、アカウント情報を読み込めません。" : pt
              ? "Não foi possível carregar sua conta agora."
              : "Could not load your account right now."
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    })();


    const authSubscription =
      supabase?.auth
        ?.onAuthStateChange(
          (
            _event,
            authSession
          ) => {
            if (!active) {
              return;
            }

            setSession({
              mode:
                "cloud",

              user:
                authSession?.user ||
                null
            });

            setLoading(
              false
            );
          }
        )
        ?.data
        ?.subscription;


    return () => {
      active =
        false;

      authSubscription
        ?.unsubscribe?.();
    };
  }, [
    pt
  ]);


  async function run(
    fn
  ) {
    setMessage(
      ""
    );

    setLoading(
      true
    );

    try {
      const result =
        await fn();

      setMessage(
        result?.ok
          ? (
            language === "ja" ? "完了しました。" : pt
              ? "Concluído."
              : "Done."
          )
          : (
            language === "ja" ? "操作を完了できませんでした。" : pt
              ? "Não foi possível concluir a operação."
              : "Could not complete the operation."
          )
      );

      await refresh();
    } catch (
      error
    ) {
      console.error(
        "Erro na conta:",
        error
      );

      setMessage(
        language === "ja" ? "現在、アカウントにアクセスできません。" : pt
          ? "Não foi possível acessar sua conta agora."
          : "Could not access your account right now."
      );

      setLoading(
        false
      );
    }
  }


  const displayName =
    localProfile.displayName ||
    localProfile.name ||
    (
      language === "ja" ? "プレイヤー" : pt
        ? "Jogador"
        : "Player"
    );

  const username =
    localProfile.username ||
    "";

  const avatar =
    localProfile.avatar ||
    null;

  const accountEmail =
    session?.user?.email ||
    email ||
    "";

  const connected =
    Boolean(
      session?.user
    );


  return (
    <main className="standard-page account-v2-page eternal-page eternal-account-page">
      <EternalCinematicBackdrop />

      <header className="account-v2-topbar">

        <button
          className="ghost account-v2-back eternal-menu-action"
          onClick={
            onBack
          }
        >
          {pt
            ? ___bsJa("Voltar", "戻る")
            : ___bsJa("Back", "戻る")}
        </button>


        <div className="account-v2-title">

          <span className="eyebrow">{___bsJa("ACCOUNT", "アカウント")}</span>

          <h1>
            {pt
              ? ___bsJa("Conta Battle Spirits", "バトルスピリッツアカウント")
              : ___bsJa("Battle Spirits Account", "バトルスピリッツアカウント")}
          </h1>

          <p>
            {pt
              ? ___bsJa("Gerencie sua identidade, login e sincronização com a nuvem.", "ID、ログイン、クラウド同期を管理します。")
              : ___bsJa("Manage your identity, login and cloud synchronization.", "ID、ログイン、クラウド同期を管理します。")}
          </p>

        </div>


        <div
          className={
            `account-v2-status ${
              connected
                ? "online"
                : accountsEnabled
                  ? "offline"
                  : "local"
            }`
          }
        >
          <i />

          <div>
            <span>
              {connected
                ? (
                  pt
                    ? ___bsJa("CONTA", "アカウント")
                    : ___bsJa("ACCOUNT", "アカウント")
                )
                : (
                  accountsEnabled
                    ? ___bsJa("CLOUD", "雲")
                    : ___bsJa("LOCAL", "ローカル")
                )}
            </span>

            <strong>
              {connected
                ? (
                  pt
                    ? ___bsJa("CONECTADA", "接続済み")
                    : ___bsJa("CONNECTED", "接続済み")
                )
                : accountsEnabled
                  ? ___bsJa("OFFLINE", "オフライン")
                  : ___bsJa("LOCAL", "ローカル")}
            </strong>
          </div>
        </div>

      </header>


      <section className="account-v2-shell">

        {!accountsEnabled ? (
          <section className="account-v2-local-state">

            <div className="account-v2-profile-card">

              <div className="account-v2-avatar">
                {avatar
                  ? (
                    <img
                      src={avatar}
                      alt=""
                    />
                  )
                  : (
                    <span>
                      {getInitials(
                        displayName
                      )}
                    </span>
                  )}
              </div>


              <div className="account-v2-profile-copy">
                <span className="eyebrow">
                  {pt
                    ? ___bsJa("PERFIL LOCAL", "ローカルプロフィール")
                    : ___bsJa("LOCAL PROFILE", "ローカルプロフィール")}
                </span>

                <h2>
                  {displayName}
                </h2>

                <p>
                  {username
                    ? `@${username}`
                    : (
                      pt
                        ? ___bsJa("Perfil salvo neste dispositivo", "このデバイスに保存されたプロフィール")
                        : ___bsJa("Profile saved on this device", "このデバイスに保存されたプロフィール")
                    )}
                </p>
              </div>


              <span className="account-v2-local-badge">{___bsJa("LOCAL", "ローカル")}</span>

            </div>


            <div className="account-v2-local-info">

              <span className="account-v2-info-icon">
                ◈
              </span>

              <div>
                <h3>
                  {pt
                    ? ___bsJa("Seu perfil continua funcionando normalmente", "ローカルプロフィールを利用できます")
                    : ___bsJa("Your profile still works normally", "ローカルプロフィールを利用できます")}
                </h3>

                <p>
                  {pt
                    ? ___bsJa("Seus decks, perfil e configurações permanecem salvos neste PC. Recursos de conta online podem ficar indisponíveis nesta instalação.", "デッキ、プロフィール、設定はこの PC に保存されたままになります。このインストールではオンライン アカウント機能が利用できない場合があります。")
                    : ___bsJa("Your decks, profile and settings remain saved on this PC. Online account features may be unavailable in this installation.", "デッキ、プロフィール、設定はこの PC に保存されたままになります。このインストールではオンライン アカウント機能が利用できない場合があります。")}
                </p>
              </div>

            </div>


            <button
              className="primary-btn big account-v2-profile-button"
              onClick={
                onProfile
              }
            >
              <span>
                {pt
                  ? ___bsJa("Abrir Social Hub", "プロフィールを開く")
                  : ___bsJa("Open Social Hub", "プロフィールを開く")}
              </span>

              <b aria-hidden="true">
                →
              </b>
            </button>

          </section>
        ) : loading ? (
          <section className="account-v2-loading">

            <div className="account-spinner" />

            <span className="eyebrow">{___bsJa("CLOUD ACCOUNT", "クラウドアカウント")}</span>

            <h2>
              {pt
                ? ___bsJa("Conectando à conta...", "アカウントに接続しています...")
                : ___bsJa("Connecting to account...", "アカウントに接続しています...")}
            </h2>

            <p>
              {pt
                ? ___bsJa("Aguarde enquanto verificamos sua sessão.", "セッションを確認するまでお待ちください。")
                : ___bsJa("Please wait while we verify your session.", "セッションを確認するまでお待ちください。")}
            </p>

          </section>
        ) : connected ? (
          <>
            <section className="account-v2-identity">

              <div className="account-v2-avatar large">
                {avatar
                  ? (
                    <img
                      src={avatar}
                      alt=""
                    />
                  )
                  : (
                    <span>
                      {getInitials(
                        displayName
                      )}
                    </span>
                  )}
              </div>


              <div className="account-v2-identity-copy">

                <span className="eyebrow">{___bsJa("ONLINE", "オンライン")}</span>

                <h2>
                  {displayName}
                </h2>

                <p className="account-v2-handle">
                  {username
                    ? `@${username}`
                    : (
                      pt
                        ? ___bsJa("Perfil Battle Spirits", "バトルスピリッツのプロフィール")
                        : ___bsJa("Battle Spirits profile", "バトルスピリッツのプロフィール")
                    )}
                </p>

                <div className="account-v2-email">
                  <span>{___bsJa("E-MAIL", "電子メール")}</span>

                  <strong>
                    {accountEmail}
                  </strong>
                </div>

              </div>


              <div className="account-v2-connected-badge">
                <i />

                <span>
                  {pt
                    ? ___bsJa("Conta conectada", "接続されたアカウント")
                    : ___bsJa("Connected account", "接続されたアカウント")}
                </span>
              </div>

            </section>


            <section className="account-v2-sync-section">

              <header className="account-v2-section-heading">

                <div>
                  <span className="eyebrow">{___bsJa("CLOUD SYNC", "クラウド同期")}</span>

                  <h3>
                    {pt
                      ? ___bsJa("Sincronização", "同期")
                      : ___bsJa("Synchronization", "同期")}
                  </h3>

                  <p>
                    {pt
                      ? ___bsJa("Envie ou recupere seus dados da nuvem.", "クラウドからデータをアップロードまたは復元します。")
                      : ___bsJa("Upload or restore your data from the cloud.", "クラウドからデータをアップロードまたは復元します。")}
                  </p>
                </div>


                <span className="account-v2-sync-state">
                  {pt
                    ? ___bsJa("NUVEM DISPONÍVEL", "クラウド利用可能")
                    : ___bsJa("CLOUD AVAILABLE", "クラウド利用可能")}
                </span>

              </header>


              <div className="account-v2-sync-grid">

                <SyncAction
                  eyebrow={
                    pt
                      ? ___bsJa("PERFIL", "プロフィール")
                      : ___bsJa("PROFILE", "プロフィール")
                  }
                  title={
                    pt
                      ? ___bsJa("Enviar para nuvem", "クラウドにアップロード")
                      : ___bsJa("Upload to cloud", "クラウドにアップロード")
                  }
                  description={
                    pt
                      ? ___bsJa("Salva avatar, banner e informações do perfil.", "アバター、バナー、プロフィール情報を保存します。")
                      : ___bsJa("Saves avatar, banner and profile information.", "アバター、バナー、プロフィール情報を保存します。")
                  }
                  icon="↑"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    run(
                      () =>
                        syncProfileToCloud()
                    )
                  }
                />


                <SyncAction
                  eyebrow={
                    pt
                      ? ___bsJa("PERFIL", "プロフィール")
                      : ___bsJa("PROFILE", "プロフィール")
                  }
                  title={
                    pt
                      ? ___bsJa("Baixar da nuvem", "クラウドからダウンロード")
                      : ___bsJa("Download from cloud", "クラウドからダウンロード")
                  }
                  description={
                    pt
                      ? ___bsJa("Restaura seu perfil salvo online.", "オンラインプロフィールを復元します。")
                      : ___bsJa("Restores your online profile.", "オンラインプロフィールを復元します。")
                  }
                  icon="↓"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    run(
                      () =>
                        loadCloudProfile()
                    )
                  }
                />


                <SyncAction
                  eyebrow={
                    pt
                      ? ___bsJa("DECKS", "デッキ")
                      : ___bsJa("DECKS", "デッキ")
                  }
                  title={
                    pt
                      ? ___bsJa("Enviar para nuvem", "クラウドにアップロード")
                      : ___bsJa("Upload to cloud", "クラウドにアップロード")
                  }
                  description={
                    pt
                      ? ___bsJa("Sincroniza sua biblioteca de decks.", "デッキライブラリを同期します。")
                      : ___bsJa("Synchronizes your deck library.", "デッキライブラリを同期します。")
                  }
                  icon="↑"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    run(
                      () =>
                        syncDecksToCloud()
                    )
                  }
                />


                <SyncAction
                  eyebrow={
                    pt
                      ? ___bsJa("DECKS", "デッキ")
                      : ___bsJa("DECKS", "デッキ")
                  }
                  title={
                    pt
                      ? ___bsJa("Baixar da nuvem", "クラウドからダウンロード")
                      : ___bsJa("Download from cloud", "クラウドからダウンロード")
                  }
                  description={
                    pt
                      ? ___bsJa("Recupera os decks salvos na conta.", "アカウントに保存されているデッキを復元します。")
                      : ___bsJa("Restores decks saved to the account.", "アカウントに保存されているデッキを復元します。")
                  }
                  icon="↓"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    run(
                      () =>
                        loadDecksFromCloud()
                    )
                  }
                />

              </div>

            </section>


            <footer className="account-v2-actions">

              <button
                className="primary-btn big account-v2-open-profile"
                onClick={
                  onProfile
                }
              >
                <span>
                  {pt
                    ? ___bsJa("Abrir Social Hub", "プロフィールを開く")
                    : ___bsJa("Open Social Hub", "プロフィールを開く")}
                </span>

                <b aria-hidden="true">
                  →
                </b>
              </button>


              <button
                className="ghost danger account-v2-signout"
                disabled={
                  loading
                }
                onClick={() =>
                  run(
                    async () => {
                      await signOut();

                      return {
                        ok:
                          true
                      };
                    }
                  )
                }
              >
                {pt
                  ? ___bsJa("Sair da conta", "サインアウト")
                  : ___bsJa("Sign out", "サインアウト")}
              </button>

            </footer>
          </>
        ) : (
          <section className="account-v2-auth">

            <div className="account-v2-auth-intro">

              <div className="account-v2-auth-mark">
                BS
              </div>


              <div>
                <span className="eyebrow">{___bsJa("CLOUD ACCOUNT", "クラウドアカウント")}</span>

                <h2>
                  {pt
                    ? ___bsJa("Entre na sua conta", "アカウントにサインインする")
                    : ___bsJa("Sign in to your account", "アカウントにサインインする")}
                </h2>

                <p>
                  {pt
                    ? ___bsJa("Sincronize perfil, decks, amigos e mensagens entre dispositivos.", "プロフィール、デッキ、友達、メッセージをデバイス間で同期します。")
                    : ___bsJa("Sync profile, decks, friends and messages across devices.", "プロフィール、デッキ、友達、メッセージをデバイス間で同期します。")}
                </p>
              </div>

            </div>


            <div className="account-v2-auth-form">

              <label>
                <span>{___bsJa("E-mail", "電子メール")}</span>

                <input
                  type="email"
                  autoComplete="email"
                  value={
                    email
                  }
                  placeholder="you@example.com"
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />
              </label>


              <label>
                <span>
                  {pt
                    ? ___bsJa("Senha", "パスワード")
                    : ___bsJa("Password", "パスワード")}
                </span>

                <input
                  type="password"
                  autoComplete="current-password"
                  value={
                    password
                  }
                  minLength={6}
                  placeholder="••••••••"
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target.value
                    )
                  }
                />
              </label>

            </div>


            <div className="account-v2-auth-actions">

              <button
                className="primary-btn big eternal-menu-action active"
                disabled={
                  loading ||
                  !email.trim() ||
                  password.length <
                    6
                }
                onClick={() =>
                  run(
                    () =>
                      signIn(
                        email.trim(),
                        password
                      )
                  )
                }
              >
                {pt
                  ? ___bsJa("Entrar", "サインイン")
                  : ___bsJa("Sign in", "サインイン")}
              </button>


              <button
                className="eternal-menu-action"
                disabled={
                  loading ||
                  !email.trim() ||
                  password.length <
                    6
                }
                onClick={() =>
                  run(
                    () =>
                      signUp(
                        email.trim(),
                        password
                      )
                  )
                }
              >
                {pt
                  ? ___bsJa("Criar conta", "アカウントを作成する")
                  : ___bsJa("Create account", "アカウントを作成する")}
              </button>

            </div>

          </section>
        )}


        {message && (
          <div className="account-v2-notice">
            <i />

            <span>
              {message}
            </span>
          </div>
        )}

      </section>

    </main>
  );
}
