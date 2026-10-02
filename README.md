# PROJECT EPOCH — World History Crossword Prototype

STAGE 01「MESOPOTAMIA」（BABYLON, c. 1750 BCE）の縦切りプロトタイプ。
クロスワードを解きながら歴史上の言葉を「発見」し、ARCHIVE に残し、言葉どうしの LINK を解放していく。

## 構成

- Expo SDK 57 / React Native 0.86 / TypeScript / Expo Router（`src/app`）
- 永続化: AsyncStorage（Web では localStorage）
- 描画: react-native-svg（仮アート）、効果音: expo-audio
- テスト: Vitest（ロジック層の純粋関数のみ）

```
src/
  app/                         画面（Expo Router）
    history/index.tsx          タイトル
    history/stage/[stageId].tsx  メイン画面（HISTORY WORLD 40% + CROSSWORD 60%）
    history/archive.tsx        ARCHIVE
    history/term/[termId].tsx  DISCOVERY 詳細（Wikipedia 導線）
    history/timeline.tsx       タイムライン（EGYPT は COMING NEXT）
  history/                     ロジック層（React 非依存・テスト対象）
    types.ts                   HistoryTerm / DiscoveryResult
    data/terms/mesopotamia.ts  歴史語彙データ
    data/stages/mesopotamia.ts ステージ定義（イベント・台詞・タップポイント）
    crossword/                 正規化・生成・検証・評価・選択
    archive/                   ARCHIVE 登録・LINK 判定・集計
    stage/                     進行・DISCOVER（調べる）・演出キュー
    input/                     入力レイヤー（キーボード／文字盤）
    store/                     React Context + 永続化
  components/history/          UI コンポーネント
    art/                       仮アート（registry.ts で画像へ差し替え可能）
scripts/generate-sounds.js     効果音 WAV の生成
```

## コマンド

```bash
npm install
npm run web          # 開発サーバ（Web）
npm start            # Expo Go / 開発ビルド
npm test             # ユニットテスト
npm run typecheck    # 型チェック
npm run export:web   # Web 静的ビルド（dist/）
```

## Crossword Generator

1. 先頭語を置き、残りの語について既存セルと同じ文字の位置をすべて探索
2. 既存語と直交する方向にだけ交差させ、`canPlace` で検証
   - 異なる文字を重ねない／同方向の語と重ねない
   - 語の前後セルが空き、新規セルの両脇が空き（不正な隣接を作らない）
   - 盤面サイズ上限（`MAX_GRID_SIZE = 15`）
3. シード付き乱数で語順・候補選択を揺らし、2 種の戦略（語順固定／全体探索）で 300 候補を生成
4. `scoreBoard`（語数 > 交差数 > 面積 > 縦横比 > スマホでの読みやすさ > 孤立語）で最良盤面を採用
5. 1 枚に入らない語は `planBoards` が BOARD B 以降で再生成。`MIN_WORDS` に満たない残りは無理に入れない

同一入力・同一シードなら同一盤面（入力順にも非依存）。盤面署名を保存し、生成ロジックが変わっても学習結果は保ったままセル状態だけ作り直す。
