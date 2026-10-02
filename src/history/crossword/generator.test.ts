import { describe, expect, it } from 'vitest';

import { MESOPOTAMIA_STAGE } from '@/history/data/stages/mesopotamia';
import { TERMS_BY_ID } from '@/history/data';

import { boardSignature, buildBoard, generateBoard, planBoards } from './generator';
import { toCells } from './normalizeJapanese';
import { measureBoard } from './scoring';
import { selectAt } from './selection';
import { DEFAULT_GENERATOR_OPTIONS, type CrosswordWord } from './types';
import { validateBoard } from './validator';

const MESO_WORDS: CrosswordWord[] = MESOPOTAMIA_STAGE.crossword.termIds.map((id) => ({
  id,
  cells: toCells(TERMS_BY_ID[id].crosswordAnswer),
}));

const OPTS = { maxGridSize: DEFAULT_GENERATOR_OPTIONS.maxGridSize };

function cellAt(board: ReturnType<typeof buildBoard>, id: string, i: number) {
  const p = board.placements.find((x) => x.id === id)!;
  return p.direction === 'across' ? [p.row, p.col + i] : [p.row + i, p.col];
}

describe('Crossword generator', () => {
  const { board, unplaced } = generateBoard(MESO_WORDS, { seed: MESOPOTAMIA_STAGE.crossword.seed });

  it('MESOPOTAMIA の 8 語をすべて 1 枚の盤面に配置できる', () => {
    expect(unplaced).toEqual([]);
    expect(board.placements).toHaveLength(8);
  });

  it('交差は同じ文字で行われ、異なる文字を重ねない', () => {
    const seen = new Map<string, string>();
    for (const p of board.placements) {
      p.cells.forEach((ch, i) => {
        const [r, c] = cellAt(board, p.id, i);
        const key = `${r}:${c}`;
        if (seen.has(key)) expect(seen.get(key)).toBe(ch);
        seen.set(key, ch);
        expect(board.grid[r][c]).toBe(ch);
      });
    }
    expect(measureBoard(board).crossings).toBeGreaterThanOrEqual(board.placements.length - 1);
  });

  it('不正な隣接（意図しない語の連なり）を生成しない・盤面が連結している', () => {
    expect(validateBoard(board, OPTS)).toEqual([]);
  });

  it('最大盤面サイズを超えない', () => {
    expect(board.width).toBeLessThanOrEqual(15);
    expect(board.height).toBeLessThanOrEqual(15);
    const small = generateBoard(MESO_WORDS, { seed: 3, maxGridSize: 9 });
    expect(small.board.width).toBeLessThanOrEqual(9);
    expect(small.board.height).toBeLessThanOrEqual(9);
    expect(validateBoard(small.board, { maxGridSize: 9 })).toEqual([]);
  });

  it('最低語数（MIN_WORDS = 5）を満たす', () => {
    expect(board.placements.length).toBeGreaterThanOrEqual(DEFAULT_GENERATOR_OPTIONS.minWords);
  });

  it('最大語数（MAX_WORDS）を超えない', () => {
    const r = generateBoard(MESO_WORDS, { seed: 1, maxWords: 6 });
    expect(r.board.placements.length).toBeLessThanOrEqual(6);
    expect(r.unplaced.length).toBe(MESO_WORDS.length - r.board.placements.length);
  });

  it('同一入力・同一シードなら同一の盤面（入力順にも依存しない）', () => {
    const a = generateBoard(MESO_WORDS, { seed: 99 });
    const b = generateBoard([...MESO_WORDS].reverse(), { seed: 99 });
    expect(boardSignature([a.board])).toBe(boardSignature([b.board]));
    expect(a.board.grid).toEqual(b.board.grid);
  });

  it('複数シードでも常に成立した盤面を返す', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const r = generateBoard(MESO_WORDS, { seed, attempts: 40 });
      expect(validateBoard(r.board, OPTS), `seed ${seed}`).toEqual([]);
    }
  });

  it('交差できない語は無理に入れない', () => {
    const words: CrosswordWord[] = [
      ...MESO_WORDS,
      { id: 'lonely', cells: toCells('ヌヌヌ') }, // どの語とも共通文字がない
    ];
    const r = generateBoard(words, { seed: 5 });
    expect(r.unplaced).toContain('lonely');
    expect(validateBoard(r.board, OPTS)).toEqual([]);
  });

  it('1 枚に入らない場合は BOARD A / BOARD B に分割できる', () => {
    // 2 つの語群は互いに共通文字を持たない
    const groupA = ['アイウ', 'ウエオ', 'オカキ', 'キクケ', 'ケコア'].map((w, i) => ({ id: `a${i}`, cells: toCells(w) }));
    const groupB = ['サシス', 'スセソ', 'ソタチ', 'チツテ', 'テトサ'].map((w, i) => ({ id: `b${i}`, cells: toCells(w) }));
    const plan = planBoards([...groupA, ...groupB], { seed: 11 });
    expect(plan.boards).toHaveLength(2);
    expect(plan.unplaced).toEqual([]);
    for (const b of plan.boards) {
      expect(b.placements.length).toBeGreaterThanOrEqual(5);
      expect(validateBoard(b, OPTS)).toEqual([]);
    }
  });

  it('最低語数に満たない残りは盤面化しない', () => {
    const groupA = ['アイウ', 'ウエオ', 'オカキ', 'キクケ', 'ケコア'].map((w, i) => ({ id: `a${i}`, cells: toCells(w) }));
    const extra = [{ id: 'x', cells: toCells('サシス') }];
    const plan = planBoards([...groupA, ...extra], { seed: 2 });
    expect(plan.boards).toHaveLength(1);
    expect(plan.unplaced).toEqual(['x']);
  });

  it('番号は読み順で振られる', () => {
    const nums = board.placements.map((p) => [p.number, p.row, p.col] as const);
    for (const [n, r, c] of nums) {
      for (const [n2, r2, c2] of nums) {
        if (r2 < r || (r2 === r && c2 < c)) expect(n2).toBeLessThan(n);
      }
    }
  });
});

describe('Crossword selection', () => {
  const { board } = generateBoard(MESO_WORDS, { seed: MESOPOTAMIA_STAGE.crossword.seed });
  // 交差セルを 1 つ探す
  const crossing = (() => {
    for (let r = 0; r < board.height; r++)
      for (let c = 0; c < board.width; c++) {
        const hits = board.placements.filter((p) =>
          p.cells.some((_, i) => {
            const [rr, cc] = cellAt(board, p.id, i);
            return rr === r && cc === c;
          }),
        );
        if (hits.length === 2) return { r, c };
      }
    throw new Error('no crossing');
  })();

  it('交差セルを再タップすると方向が切り替わる', () => {
    const first = selectAt(board, crossing.r, crossing.c, null)!;
    expect(first.direction).toBe('across');
    const second = selectAt(board, crossing.r, crossing.c, first)!;
    expect(second.direction).toBe('down');
    const third = selectAt(board, crossing.r, crossing.c, second)!;
    expect(third.direction).toBe('across');
  });

  it('解答済みの語より未解答の語を優先して選ぶ', () => {
    const first = selectAt(board, crossing.r, crossing.c, null)!;
    const sel = selectAt(board, crossing.r, crossing.c, null, (id) => id === first.placementId)!;
    expect(sel.placementId).not.toBe(first.placementId);
  });

  it('空きセルは選択しない', () => {
    for (let r = 0; r < board.height; r++)
      for (let c = 0; c < board.width; c++) {
        if (board.grid[r][c] === null) expect(selectAt(board, r, c, null)).toBeNull();
      }
  });
});
