import { japaneseText as ___bsJa } from "../../localization/displayLanguage.js";
import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Battle Spirits renderer error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="fatal-error-page">
        <section className="fatal-error-card">
          <span className="eyebrow">{___bsJa("BATTLE SPIRITS", "バトルスピリッツ")}</span>
          <h1>{___bsJa("O simulador encontrou um erro", "シミュレーターでエラーが発生しました")}</h1>
          <p>{___bsJa("A interface foi protegida para não ficar em uma tela vazia. Você pode voltar ao menu recarregando a janela.", "インターフェイスは空の画面に残らないように保護されています。ウィンドウをリロードするとメニューに戻ることができます。")}</p>
          <div className="row-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => window.location.reload()}
            >{___bsJa("Recarregar simulador", "シミュレータをリロードする")}</button>
          </div>
        </section>
      </main>
    );
  }
}
