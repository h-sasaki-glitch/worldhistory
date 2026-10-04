import { createRng, hashString, shuffle } from './random';
import { scoreBoard } from './scoring';
import {
  DEFAULT_GENERATOR_OPTIONS,
  type Board,
  type BoardPlan,
  type CrosswordWord,
  type Direction,
  type GeneratorOptions,
  type Placement,
} from './types';

/**
 * 歴史用語からクロスワード盤面を生成する。
 *
 * 方式: シード付き乱数で語順を変えた候補を attempts 回生成（貪欲配置）し、
 * scoreBoard で最も良い盤面を採用する。
 *
 * 1 回の候補生成:
 *   1. 先頭語を横向きに置く
 *   2. 残りの語について、既存セルと同じ文字の位置をすべて探索（共通文字の探索）
 *   3. 交差方向（既存語と直交）で置ける位置を検証（canPlace）
 *   4. 交差数・面積で局所評価し、上位から乱数で 1 つ選んで配置
 *   5. どこにも置けない語は後回しにし、進展がなくなるまで繰り返す
 */

type Slot = { ch: string; across?: string; down?: string };

type RawPlacement = Omit<Placement, 'number'>;

class Layout {
  cells = new Map<string, Slot>();
  placed: RawPlacement[] = [];
  minR = 0;
  maxR = -1;
  minC = 0;
  maxC = -1;

  get(r: number, c: number): Slot | undefined {
    return this.cells.get(`${r}:${c}`);
  }

  isEmpty(): boolean {
    return this.placed.length === 0;
  }

  /** 置ける場合は交差数、置けない場合は -1 */
  canPlace(word: CrosswordWord, r: number, c: number, dir: Direction, limit: SizeLimit): number {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    const n = word.cells.length;

    // 語の前後は空きであること（別の語と連結して不正な語を作らない）
    if (this.get(r - dr, c - dc) || this.get(r + dr * n, c + dc * n)) return -1;

    let crossings = 0;
    for (let i = 0; i < n; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const slot = this.get(rr, cc);
      if (slot) {
        // 異なる文字は重ねない／同方向の語とは重ねない
        if (slot.ch !== word.cells[i] || slot[dir]) return -1;
        crossings++;
      } else {
        // 新規セルの両脇（直交方向）が空いていること＝不正な隣接を作らない
        if (dir === 'across') {
          if (this.get(rr - 1, cc) || this.get(rr + 1, cc)) return -1;
        } else if (this.get(rr, cc - 1) || this.get(rr, cc + 1)) return -1;
      }
    }

    if (!this.isEmpty() && crossings === 0) return -1;
    if (crossings === n) return -1;

    const minR = Math.min(this.isEmpty() ? r : this.minR, r);
    const maxR = Math.max(this.isEmpty() ? r : this.maxR, r + dr * (n - 1));
    const minC = Math.min(this.isEmpty() ? c : this.minC, c);
    const maxC = Math.max(this.isEmpty() ? c : this.maxC, c + dc * (n - 1));
    const h = maxR - minR + 1;
    const w = maxC - minC + 1;
    if (Math.max(h, w) > limit.maxSize || Math.min(h, w) > limit.maxShortSide) return -1;

    return crossings;
  }

  /** 配置後の外接矩形の面積（局所評価用） */
  areaAfter(word: CrosswordWord, r: number, c: number, dir: Direction): number {
    const n = word.cells.length;
    const er = dir === 'down' ? r + n - 1 : r;
    const ec = dir === 'across' ? c + n - 1 : c;
    const h = Math.max(this.maxR, er) - Math.min(this.minR, r) + 1;
    const w = Math.max(this.maxC, ec) - Math.min(this.minC, c) + 1;
    return w * h + Math.abs(w - h) * 2;
  }

  place(word: CrosswordWord, r: number, c: number, dir: Direction): void {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    const first = this.isEmpty();
    word.cells.forEach((ch, i) => {
      const key = `${r + dr * i}:${c + dc * i}`;
      const slot = this.cells.get(key) ?? { ch };
      slot[dir] = word.id;
      this.cells.set(key, slot);
    });
    const er = r + dr * (word.cells.length - 1);
    const ec = c + dc * (word.cells.length - 1);
    this.minR = first ? r : Math.min(this.minR, r);
    this.maxR = first ? er : Math.max(this.maxR, er);
    this.minC = first ? c : Math.min(this.minC, c);
    this.maxC = first ? ec : Math.max(this.maxC, ec);
    this.placed.push({ id: word.id, cells: word.cells, row: r, col: c, direction: dir });
  }
}

/** 盤面の大きさの上限。長辺は maxSize、短辺は maxShortSide まで（向きはあとで横長にそろえられる） */
type SizeLimit = { maxSize: number; maxShortSide: number };

function sizeLimit(opts: GeneratorOptions): SizeLimit {
  return { maxSize: opts.maxGridSize, maxShortSide: opts.maxShortSide ?? opts.maxGridSize };
}

type Candidate = { r: number; c: number; dir: Direction; crossings: number; area: number };

function findCandidates(layout: Layout, word: CrosswordWord, limit: SizeLimit): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const [key, slot] of layout.cells) {
    const [sr, sc] = key.split(':').map(Number);
    // 既存語と直交する方向にのみ交差させる
    const dir: Direction | null = slot.across && !slot.down ? 'down' : slot.down && !slot.across ? 'across' : null;
    if (!dir) continue;
    word.cells.forEach((ch, i) => {
      if (ch !== slot.ch) return;
      const r = dir === 'down' ? sr - i : sr;
      const c = dir === 'across' ? sc - i : sc;
      const id = `${r}:${c}:${dir}`;
      if (seen.has(id)) return;
      seen.add(id);
      const crossings = layout.canPlace(word, r, c, dir, limit);
      if (crossings > 0) out.push({ r, c, dir, crossings, area: layout.areaAfter(word, r, c, dir) });
    });
  }
  return out;
}

/** 正規化（左上を 0,0）と番号付けを行い Board を作る */
export function buildBoard(raw: RawPlacement[]): Board {
  if (raw.length === 0) return { width: 0, height: 0, placements: [], grid: [] };
  let minR = Infinity;
  let minC = Infinity;
  let maxR = -Infinity;
  let maxC = -Infinity;
  for (const p of raw) {
    const n = p.cells.length;
    minR = Math.min(minR, p.row);
    minC = Math.min(minC, p.col);
    maxR = Math.max(maxR, p.direction === 'down' ? p.row + n - 1 : p.row);
    maxC = Math.max(maxC, p.direction === 'across' ? p.col + n - 1 : p.col);
  }
  const height = maxR - minR + 1;
  const width = maxC - minC + 1;
  const grid: (string | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
  const shifted = raw.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }));
  for (const p of shifted) {
    p.cells.forEach((ch, i) => {
      const r = p.direction === 'down' ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      grid[r][c] = ch;
    });
  }

  // 読み順（上→下、左→右）で開始セルに番号を振る
  const starts = Array.from(new Set(shifted.map((p) => `${p.row}:${p.col}`)))
    .map((k) => k.split(':').map(Number) as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numberOf = new Map(starts.map(([r, c], i) => [`${r}:${c}`, i + 1]));

  const placements: Placement[] = shifted
    .map((p) => ({ ...p, number: numberOf.get(`${p.row}:${p.col}`)! }))
    .sort((a, b) => a.number - b.number || (a.direction === 'across' ? -1 : 1));

  return { width, height, placements, grid };
}

/**
 * 盤面を転置する（横の語は縦に、縦の語は横に）。
 * 日本語のクロスワードは横＝左→右、縦＝上→下に読むので、転置しても語の読み方は変わらない。
 * スマートフォン縦画面では盤面の領域が横長になるため、縦長の盤面を横長に直して使う。
 */
export function transposeBoard(board: Board): Board {
  return buildBoard(
    board.placements.map((p) => ({
      id: p.id,
      cells: p.cells,
      row: p.col,
      col: p.row,
      direction: p.direction === 'across' ? 'down' : 'across',
    })),
  );
}

/**
 * 全体探索版: 毎手、未配置の全語の全候補から「交差数が多く・面積が小さい」ものを
 * 上位から乱数で選ぶ。語順固定版より密な盤面になりやすい。
 */
function generateGlobal(
  layout: Layout,
  pending: CrosswordWord[],
  opts: GeneratorOptions,
  rng: () => number,
): Board {
  let rest = pending;
  while (rest.length > 0 && layout.placed.length < opts.maxWords) {
    const all: (Candidate & { word: CrosswordWord })[] = [];
    for (const word of rest) {
      for (const c of findCandidates(layout, word, sizeLimit(opts))) all.push({ ...c, word });
    }
    if (all.length === 0) break;
    all.sort(
      (a, b) =>
        b.crossings - a.crossings ||
        a.area - b.area ||
        (a.word.id < b.word.id ? -1 : a.word.id > b.word.id ? 1 : 0) ||
        a.r - b.r ||
        a.c - b.c,
    );
    const top = all.slice(0, Math.min(4, all.length));
    const pick = top[Math.floor(rng() * top.length)];
    layout.place(pick.word, pick.r, pick.c, pick.dir);
    rest = rest.filter((w) => w !== pick.word);
  }
  return buildBoard(layout.placed);
}

function generateOnce(
  words: CrosswordWord[],
  opts: GeneratorOptions,
  rng: () => number,
  strategy: 'ordered' | 'global',
): Board {
  const layout = new Layout();
  // 長い語を先頭に置きやすくしつつ、語順は乱数で揺らす
  const longest = Math.max(...words.map((w) => w.cells.length));
  const heads = words.filter((w) => w.cells.length >= longest - 1);
  const head = heads[Math.floor(rng() * heads.length)];
  const rest = shuffle(
    words.filter((w) => w !== head),
    rng,
  );

  layout.place(head, 0, 0, rng() < 0.5 ? 'across' : 'down');

  if (strategy === 'global') return generateGlobal(layout, rest, opts, rng);

  let pending = rest;
  let progressed = true;
  while (pending.length > 0 && progressed && layout.placed.length < opts.maxWords) {
    progressed = false;
    const next: CrosswordWord[] = [];
    for (const word of pending) {
      if (layout.placed.length >= opts.maxWords) {
        next.push(word);
        continue;
      }
      const cands = findCandidates(layout, word, sizeLimit(opts));
      if (cands.length === 0) {
        next.push(word);
        continue;
      }
      cands.sort((a, b) => b.crossings - a.crossings || a.area - b.area || a.r - b.r || a.c - b.c);
      const top = cands.slice(0, Math.min(3, cands.length));
      const pick = top[Math.floor(rng() * top.length)];
      layout.place(word, pick.r, pick.c, pick.dir);
      progressed = true;
    }
    pending = next;
  }
  return buildBoard(layout.placed);
}

export type GenerateResult = { board: Board; score: number; unplaced: string[] };

/** 複数候補を生成し、最も評価の高い盤面を返す。同一入力・同一シードなら同一結果。 */
export function generateBoard(
  words: CrosswordWord[],
  options: Partial<GeneratorOptions> = {},
): GenerateResult {
  const opts = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
  if (words.length === 0) return { board: buildBoard([]), score: 0, unplaced: [] };
  const tooLong = words.filter((w) => w.cells.length > opts.maxGridSize).map((w) => w.id);
  const usable = words.filter((w) => w.cells.length <= opts.maxGridSize);
  // 入力順に依存しないよう ID 順に並べてから乱数で揺らす
  const sorted = usable.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const rng = createRng(opts.seed);

  let best: Board | null = null;
  let bestScore = -Infinity;
  for (let i = 0; i < opts.attempts; i++) {
    const board = generateOnce(sorted, opts, rng, i % 2 === 0 ? 'ordered' : 'global');
    const score = scoreBoard(board);
    if (score > bestScore) {
      best = board;
      bestScore = score;
    }
  }
  const placedIds = new Set(best!.placements.map((p) => p.id));
  const board = opts.landscape && best!.height > best!.width ? transposeBoard(best!) : best!;
  return {
    board,
    score: bestScore,
    unplaced: [...tooLong, ...sorted.filter((w) => !placedIds.has(w.id)).map((w) => w.id)],
  };
}

/**
 * 語群を 1 枚以上の盤面（BOARD A, BOARD B, …）に割り当てる。
 * - 1 枚目に入らなかった語は 2 枚目以降で再生成する
 * - minWords を満たせない残りの語は無理に入れず unplaced として返す
 */
export function planBoards(words: CrosswordWord[], options: Partial<GeneratorOptions> = {}): BoardPlan {
  const opts = { ...DEFAULT_GENERATOR_OPTIONS, ...options };
  const boards: Board[] = [];
  let remaining = words.slice();
  let seed = opts.seed;
  while (remaining.length > 0) {
    const { board, unplaced } = generateBoard(remaining, { ...opts, seed });
    const required = Math.min(opts.minWords, remaining.length);
    if (board.placements.length < required || (boards.length > 0 && board.placements.length < opts.minWords)) {
      break;
    }
    boards.push(board);
    remaining = remaining.filter((w) => unplaced.includes(w.id));
    seed = (seed + 0x9e3779b9) >>> 0;
  }
  return { boards, unplaced: remaining.map((w) => w.id) };
}

/** 保存データとの整合確認に使う盤面署名 */
export function boardSignature(boards: Board[]): string {
  const text = boards
    .map((b) => b.placements.map((p) => `${p.id}@${p.row},${p.col},${p.direction[0]}`).join('|'))
    .join('#');
  return hashString(text).toString(36);
}
