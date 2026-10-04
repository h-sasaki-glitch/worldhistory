# PROJECT EPOCH — World History Crossword Prototype

世界史クロスワードのプロトタイプ。クロスワードを解きながら歴史上の言葉を「発見」し、ARCHIVE に残し、
言葉どうしの LINK と、時代をまたぐつながり（ACROSS TIME）を解放していく。対象は中学生（高校受験レベル）。

| STAGE | 訪れる年（visitYear） | 舞台 | 文明のはじまり（civilizationStartYear） |
|---|---|---|---|
| 01 EGYPT | BC 2570 | ギザ（クフ王） | エジプト文明 BC 3000 ごろ |
| 02 INDUS | BC 2300 | モヘンジョ・ダロ | インダス文明 BC 2600 ごろ |
| 03 MESOPOTAMIA | BC 1750 | バビロン（ハンムラビ王） | メソポタミア文明 BC 3500 ごろ |
| 04 CHINA | BC 1200 | 殷の都（武丁） | 中国文明 BC 1600 ごろ |
| 05 GREECE | BC 440 | アテネ（ペリクレス） | ギリシア文明 BC 800 ごろ |
| 06 QIN | BC 210 | 咸陽（始皇帝） | 中国文明 BC 1600 ごろ |
| 07 ROME | AD 120 | ローマ（ハドリアヌス帝） | ローマ文明 BC 753（伝説上の建国） |
| — ARABIA | AD 610 | COMING NEXT（予告のみ） | |

### 時間軸のモデル

- **文明の起点**（`data/civilizations.ts` の `startYear`）と、**プレイヤーが訪れる年**（ステージの `visitYear`）を分ける。
  メソポタミア文明は BC 3500 ごろに始まるが、ステージで訪れるのは BC 1750 のバビロンなので、BC 2570 のギザより後に来る。
- ステージの並び・STAGE 番号・「次の時代」は `visitYear` の昇順から決まる（`stage/chronology.ts`）。データに番号や次のステージは持たない。
- 同じ文明を別の年に訪れるステージは `civilizationId` を共有する（例: 殷と秦はどちらも中国文明）。
  将来 SUMER/URUK（BC 3000）を加えても、BABYLON（BC 1750）の前に自動で並ぶ。
- 並び順を変えても、すでに記録のある時代は開いたままにする（`stage/journey.ts`）。

### 用語どうしの関係

- `conceptId`（`data/concepts.ts`）は **分類** だけを表す（例: ハンムラビ法典とローマ法はどちらも「法のしくみ」）。
- 関係の種類は `HistoricalRelation`（`data/relations.ts`）として別に持つ:
  `SAME_CATEGORY`（同じ分類）／`COMPARE`（比較）／`CONTRAST`（対照）／`INFLUENCE`（影響）／`CAUSE`（因果）／`CONTEMPORARY`（同時代）／`EVOLUTION`（発展）。
  向きのある関係（影響・因果・発展）は from → to で書き、見る側によって「影響元／影響先」のように表示を変える。
- 確かな根拠のあるものだけを置き、不確かな直接の影響関係は置かない。似ているだけのものは `COMPARE` とし、note に「直接の影響はない」と明記する。
- ARCHIVE の CONNECTED と ACROSS TIME に、関係の種類（比較・対照・発展・影響・同じ分類…）と一文の説明を出す。

新しい時代は `data/terms` と `data/stages` にデータを、`components/history/art` に背景と人物を追加し、
`data/index.ts` と `art/registry.ts` に登録する（並び順は visitYear で自動的に決まる）。

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
    history/timeline.tsx       タイムライン（訪れる年の順。最後に COMING NEXT）
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
6. ステージの盤面はスマートフォン向けに **長辺 12・短辺 8 マス以内** で生成し、縦長なら転置して横長にそろえる
   （375×560 の画面で、文字盤が 2 行に折り返してもマス 28px 以上）。1 枚に収まらない時代は、
   ステージ定義の `crossword.boards` で意味のまとまりごとに盤面を分ける（例: EGYPT「文明と暮らし」「技術と建造物」）

同一入力・同一シードなら同一盤面（入力順にも非依存）。盤面署名を保存し、生成ロジックが変わっても学習結果は保ったままセル状態だけ作り直す。

文字盤（タイル入力）は、長い語（例: バンリノチョウジョウ）でタイルを縮めず 2 行に折り返す（`input/tileLayout.ts`）。

## 保存データ

保存先は `epoch:v2:*` のまま、読み込み時に現在の語彙・盤面へ合わせる。
- 盤面署名が変わった時代は、語ごとの学習結果を残してセルだけ作り直す
- 語彙の見直しで外した語（秦の「法律」→「法家」）の進捗・ARCHIVE の記録・LINK は取り除く
- 新しい語が未解答になった時代は完了扱いを取り消し、その語を解けば再び完了する
