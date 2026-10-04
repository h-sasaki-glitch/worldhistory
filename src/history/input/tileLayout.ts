/**
 * 文字盤（タイル）の並べ方（純粋関数）。
 *
 * 長い語（例: バンリノチョウジョウ＝10 文字＋ダミー 4＋⌫ で 15 個）を 1 行に詰めると、
 * 1 個あたり 20px を下回り押しにくい。タイルを小さくするのではなく、行を増やして折り返す。
 */
export type TileLayout = {
  /** タイルの一辺（px） */
  size: number;
  /** 1 行に並べる数 */
  perRow: number;
  rows: number;
  /** タイルの高さ（1 行のときは少し縦長、折り返すときは盤面を圧迫しないよう正方形） */
  height: number;
};

export const TILE_GAP = 5;
export const MAX_TILE = 40;
/** これより小さくなるなら折り返す（指で確実に押せる大きさの目安） */
export const MIN_TILE = 34;
/** 折り返すときのタイルの上限（2 行分の高さが盤面のマスを削らないように） */
export const WRAP_MAX_TILE = 36;
/** 行の上限。これでも MIN_TILE に届かない場合は、この行数で収まる最大の大きさにする */
export const MAX_TILE_ROWS = 3;

export function tileLayout(width: number, count: number, gap = TILE_GAP): TileLayout {
  if (width <= 0 || count <= 0) return { size: 0, perRow: Math.max(0, count), rows: count > 0 ? 1 : 0, height: 0 };
  const sizeFor = (perRow: number, max: number) => Math.min(max, Math.floor((width - gap * (perRow - 1)) / perRow));
  for (let rows = 1; rows <= MAX_TILE_ROWS; rows++) {
    const perRow = Math.ceil(count / rows);
    const size = sizeFor(perRow, rows === 1 ? MAX_TILE : WRAP_MAX_TILE);
    if (size >= MIN_TILE || rows === MAX_TILE_ROWS) {
      const used = Math.ceil(count / perRow);
      return { size, perRow, rows: used, height: used === 1 ? size + 4 : size };
    }
  }
  /* istanbul ignore next */
  return { size: sizeFor(count, MAX_TILE), perRow: count, rows: 1, height: sizeFor(count, MAX_TILE) + 4 };
}
