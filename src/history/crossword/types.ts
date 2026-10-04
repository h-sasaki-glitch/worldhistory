export type Direction = 'across' | 'down';

export type CrosswordWord = {
  id: string;
  cells: string[];
};

export type Placement = {
  id: string;
  cells: string[];
  row: number;
  col: number;
  direction: Direction;
  /** 盤面上のクルー番号（読み順で採番） */
  number: number;
};

export type Board = {
  width: number;
  height: number;
  placements: Placement[];
  /** grid[row][col] = 文字 または null（空き） */
  grid: (string | null)[][];
};

export type GeneratorOptions = {
  maxGridSize: number;
  minWords: number;
  maxWords: number;
  /** 乱数シード。同じ入力・同じシードなら同じ盤面になる */
  seed: number;
  /** 生成する候補盤面の数 */
  attempts: number;
  /** 短辺の上限（省略時は maxGridSize）。スマートフォンでマスを小さくしないための制約 */
  maxShortSide?: number;
  /** true なら縦長の盤面を転置して横長にそろえる */
  landscape?: boolean;
};

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  maxGridSize: 15,
  minWords: 5,
  maxWords: 9,
  seed: 1,
  attempts: 300,
};

export type BoardPlan = {
  boards: Board[];
  /** どの盤面にも成立する形で入らなかった語 */
  unplaced: string[];
};

export type CellPos = { row: number; col: number };
