# バトルスピリッツ対戦シミュレーター

このリポジトリは、[Battle Spirits: KAIHOU! Simulator](https://github.com/Zeraujy/battle-spirits-web) のフォークです。[エターナル形式](https://www.battlespirits.com/rule/official-rule-manual-eternal/)を対象とする非公式のファン制作アプリです。公式のアプリではありません。

## ローカルで起動する

Node.js は元リポジトリの `.node-version` に記載されたバージョンを推奨します。

```bash
npm ci
npm run dev
```

表示されたローカル URL をブラウザで開きます。初回はスターターデッキを3つ選ぶと、そのデッキを使って CPU 対戦やフリープレイを開始できます。

ゲストのデッキとコレクションはブラウザのセッションに保存されます。タブやブラウザの終了後に残ることは保証されません。

## ローカルのオンライン対戦サーバー

別のターミナルで次を実行します。

```bash
HOST=127.0.0.1 npm run dev:server
```

初期状態の接続先は `http://127.0.0.1:3001` です。離れた端末同士で対戦するには、到達可能なサーバーの設置と接続先の設定が必要です。ビルド時に `VITE_ONLINE_SERVER_URL` を指定するか、`public/config/online-config.js` を設定してください。アカウント関連機能やランク対戦には追加の Supabase 設定が必要です。

## 現在の対応範囲

- 日本語を初期表示に設定し、対戦、デッキ構築、オンラインロビー、チュートリアル、カード名や効果文を日本語化しています。設定から英語・ポルトガル語にも切り替えられます。カードの効果文には機械翻訳を含む参考訳があるため、正確な内容はカード画像をご確認ください。
- カードや効果の網羅・正確性は保証されていません。自動処理に対応していない効果は手動処理が必要な場合があります。元プロジェクトの [ルール対応状況](docs/game-rules/rules-coverage.md) と [スターターデッキの対応状況](docs/effects/starter-deck-readiness.md) を参照してください。
- 狭い縦向き画面では盤面や手札が見づらい場合があります。PC または横向きの画面を推奨します。
- 元リポジトリのコードには再利用ライセンスが明記されていません。コードの改変と再公開については、依頼者が作者から許可を得ています。カード画像などの権利は別途確認してください。

## 検証

```bash
npm test
node --test src/features/arena-visual/controller/ArenaVisualControllerBridge.test.js
node --test server/roomFlow.test.js
npm run build
```

`server/roomFlow.test.js` はローカルの空きポートを使って、2 接続による部屋の作成、参加、対戦開始を確認します。
