import type { Board, GeneratorOptions } from './types';

/**
 * 盤面がクロスワードとして成立しているかを検証する。問題がなければ空配列。
 * - 盤面サイズ上限
 * - 各語の文字が盤面と一致（異なる文字を重ねていない）
 * - 盤面上の 2 文字以上の連なりは必ずいずれかの語と一致（不正な隣接がない）
 * - すべての文字セルがつながっている（孤立語がない）
 */
export function validateBoard(board: Board, opts: Pick<GeneratorOptions, 'maxGridSize'>): string[] {
  const errors: string[] = [];
  const { width, height, grid, placements } = board;

  if (width > opts.maxGridSize || height > opts.maxGridSize) {
    errors.push(`board ${width}x${height} exceeds ${opts.maxGridSize}`);
  }

  const covered = new Set<string>();
  const runs = new Set<string>();
  for (const p of placements) {
    runs.add(`${p.direction}:${p.row}:${p.col}:${p.cells.length}`);
    p.cells.forEach((ch, i) => {
      const r = p.direction === 'down' ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      if (r < 0 || c < 0 || r >= height || c >= width) {
        errors.push(`${p.id} out of bounds`);
        return;
      }
      if (grid[r][c] !== ch) errors.push(`${p.id} letter mismatch at ${r}:${c}`);
      covered.add(`${r}:${c}`);
    });
  }

  // 盤面上の連なりを走査し、語と 1:1 に対応しているか
  const found = new Set<string>();
  const scan = (dir: 'across' | 'down') => {
    const outer = dir === 'across' ? height : width;
    const inner = dir === 'across' ? width : height;
    for (let o = 0; o < outer; o++) {
      let start = -1;
      for (let i = 0; i <= inner; i++) {
        const ch = i < inner ? (dir === 'across' ? grid[o][i] : grid[i][o]) : null;
        if (ch !== null && start < 0) start = i;
        if (ch === null && start >= 0) {
          const len = i - start;
          if (len >= 2) {
            const key = dir === 'across' ? `across:${o}:${start}:${len}` : `down:${start}:${o}:${len}`;
            found.add(key);
            if (!runs.has(key)) errors.push(`unexpected word run ${key}`);
          }
          start = -1;
        }
      }
    }
  };
  scan('across');
  scan('down');
  for (const r of runs) if (!found.has(r)) errors.push(`word ${r} is not a maximal run`);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (grid[r][c] !== null && !covered.has(`${r}:${c}`)) errors.push(`stray letter at ${r}:${c}`);
    }
  }

  // 連結性
  const letters = [...covered];
  if (letters.length > 0) {
    const seen = new Set<string>([letters[0]]);
    const queue = [letters[0]];
    while (queue.length) {
      const [r, c] = queue.pop()!.split(':').map(Number);
      for (const [nr, nc] of [
        [r + 1, c],
        [r - 1, c],
        [r, c + 1],
        [r, c - 1],
      ]) {
        const k = `${nr}:${nc}`;
        if (covered.has(k) && !seen.has(k)) {
          seen.add(k);
          queue.push(k);
        }
      }
    }
    if (seen.size !== covered.size) errors.push('board is not connected');
  }

  return errors;
}
