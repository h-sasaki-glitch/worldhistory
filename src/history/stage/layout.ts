/**
 * ステージ画面の縦の配分（純粋関数）。
 *
 * 盤面が読めることを最優先にする。
 *   1. 横幅から決まる理想のマス（最大 40px）で盤面に必要な高さを出す
 *   2. 手がかりパネルの実測の高さを引く
 *   3. 残りを HISTORY WORLD に回す（下限・上限あり）。足りなければマスを縮める
 */
export type StageLayoutInput = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  /** 手がかりパネルの実測の高さ */
  clueHeight: number;
  /** 盤面の上に BOARD A/B のタブがあるか */
  tabs?: boolean;
};

export type StageLayout = {
  worldHeight: number;
  /** 盤面のマスの大きさ（目安。実際は盤面領域から再計算される） */
  cellSize: number;
  /** HISTORY WORLD を小さく組むか（見出し・字幕を詰める） */
  compact: boolean;
};

export const MAX_CELL = 40;
export const BOARD_PADDING = 12;
const TAB_HEIGHT = 28;

export function stageLayout(input: StageLayoutInput): StageLayout {
  const { width, height, cols, rows, clueHeight } = input;
  const extra = BOARD_PADDING + (input.tabs ? TAB_HEIGHT : 0);
  // 背景の DISCOVERY を見出しの下に収めるための下限（artSpace.test.ts で検証）
  const minWorld = height < 640 ? 124 : 130;
  const maxWorld = Math.round(height * 0.42);

  const byWidth = Math.min(MAX_CELL, Math.floor((width - BOARD_PADDING) / Math.max(1, cols)));
  const boardNeed = byWidth * rows + extra;
  const worldHeight = Math.max(minWorld, Math.min(maxWorld, height - clueHeight - boardNeed));
  const byHeight = Math.floor((height - worldHeight - clueHeight - extra) / Math.max(1, rows));
  const cellSize = Math.max(0, Math.min(byWidth, byHeight));

  return { worldHeight, cellSize, compact: worldHeight < 190 };
}
