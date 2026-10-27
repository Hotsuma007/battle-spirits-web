import { getDisplayLanguage } from "./displayLanguage.js";

const translations = {
  "Blazing Thunder": "紅蓮の稲妻",
  "Diamond Deity": "白銀の機神",
  "Roaring Heaven's Door": "轟天のヘヴンズドア",
  "Dan Bashin Deck: Brave Dragon of the Sun": "馬神ダンデッキ 太陽の合体ドラゴン",
  "Tsurugi Deck: Shining Charge": "ツルギデッキ【シャイニングチャージ】",
  "The Midnight King Yaiba's Deck: Dark Rush": "白夜王ヤイバデッキ【ダークラッシュ】",
  "Attribute Eye-Opening Deck: Amethyst": "属性開眼デッキ【アメジスト】",
  "Attribute Eye-Opening Deck: Emerald": "属性開眼デッキ【エメラルド】",
  "Attribute Eye-Opening Deck: Topaz": "属性開眼デッキ【トパーズ】",
  "Attribute Eye-Opening Deck: Sapphire": "属性開眼デッキ【サファイア】",
  "New Tsurugi Deck: Darkness Fang": "新ツルギデッキ【ダークネスファング】",
  "Ultimate Deck: Scorching Zero": "アルティメットデッキ【灼熱のゼロ】",
  "Ultimate Deck: Silver Zero": "アルティメットデッキ【白銀のゼロ】",
  "Ultimate Deck: Zero the Hurricane": "アルティメットデッキ【疾風のゼロ】",
  "Ultimate Deck: Eris the Morning Star": "アルティメットデッキ【明の明星のエリス】",
  "Ultimate Deck: Land of Deep Green": "アルティメットデッキ【深緑の大地】",
  "Battle Spirits Dash Deck: The Infinite Bond": "バトスピダッシュデッキ 無限の絆",
  "Eternal Sleeve 01": "エターナルスリーブ 01", "Eternal Playmat 01": "エターナルプレイマット 01", "Sleeve": "スリーブ", "Playmat": "プレイマット",
  "Starter Deck": "構築済みデッキ", "Booster Pack": "ブースターパック", "Dream Booster": "ドリームブースター", "Premium Card Set": "プレミアムカードセット",
  "Boosters": "ブースター", "Decks": "デッキ", "Acessórios": "アクセサリー", "Accessories": "アクセサリー", "Coleção": "コレクション", "Collection": "コレクション",
  "Wanderer Lolo Saga": "少年突破バシン・少年激覇ダン編", "Constellation Saga": "星座編", "Sword Blade Saga": "剣刃編", "Ultimate Battle Saga": "アルティメットバトル編", "Contract Saga": "契約編", "Supplementary Sets": "その他のセット",
  "Primeiro bloco principal de Battle Spirits, BS01–BS09.": "バトルスピリッツ初期のブースター、BS01〜BS09。",
  "The first main Battle Spirits block, BS01–BS09.": "バトルスピリッツ初期のブースター、BS01〜BS09。",
  "Bloco principal BS10–BS13.": "ブースター BS10〜BS13。", "Main set block BS10–BS13.": "ブースター BS10〜BS13。",
  "Produtos da era Sword Blade/Sword Eyes.": "剣刃編の関連商品。", "Products from the Sword Blade / Sword Eyes era.": "剣刃編の関連商品。",
  "Produtos da era Ultimate Battle / Ultimate Zero.": "アルティメットバトル編の関連商品。", "Products from the Ultimate Battle / Ultimate Zero era.": "アルティメットバトル編の関連商品。",
  "Produtos lançados na era Contract Saga, incluindo conteúdos comemorativos de Ultimate Zero.": "契約編の商品とアルティメットゼロの記念商品。", "Products released in the Contract Saga era, including Ultimate Zero anniversary products.": "契約編の商品とアルティメットゼロの記念商品。",
  "Dream Boosters, Theme Packs e outros produtos suplementares.": "ドリームブースターやテーマパックなど。", "Dream Boosters, Theme Packs and other supplementary products.": "ドリームブースターやテーマパックなど。"
};

export function localizeShopText(value, language = getDisplayLanguage()) {
  return language === "ja" ? translations[value] || value : value;
}
