# バトルスピリッツ 界放シミュレーター

[詳しい説明と起動方法](README.ja.md)

このアプリは、バトルスピリッツをオンラインで遊ぶための非公式ファン制作シミュレーターです。

営利目的ではなく、バンダイの公式アプリではありません。バトルスピリッツの名称、画像、キャラクター、カードなどの権利は、それぞれの権利者に帰属します。

## 構成

v4.8.1 以降は、Web アプリとオンライン対戦サーバーを使用します。

- 画面：React と Vite
- Web 配信：Cloudflare
- オンライン対戦：画面とは別の Node.js と Socket.IO のサーバー
- アカウントとクラウド機能：Supabase

## 開発

```bash
npm install
npm run dev
```

## 検証

```bash
npm run project:check
```

## Web 公開

```bash
npm run publish:cloudflare
```

カードセットの追加方法は [カードセットの追加](docs/card-database/adding-new-sets.md) を参照してください。

## 技術資料

[技術資料の索引](docs/README.md) に、各資料と管理方針を掲載しています。
