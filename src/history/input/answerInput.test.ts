import { describe, expect, it } from 'vitest';

import { toCells } from '@/history/crossword/normalizeJapanese';

import { buildLetterTiles, checkAnswer } from './answerInput';

describe('Answer input', () => {
  const answer = toCells('クサビガタモジ');

  it('ひらがな入力でも正解判定できる', () => {
    expect(checkAnswer('くさびがたもじ', answer)).toEqual({ kind: 'correct' });
    expect(checkAnswer('クサビガタモジ', answer)).toEqual({ kind: 'correct' });
  });

  it('漢字は正解にしない（表示名と解答を混同しない）', () => {
    expect(checkAnswer('楔形文字', answer)).toEqual({ kind: 'invalid' });
  });

  it('文字数違い・不正解を区別する', () => {
    expect(checkAnswer('くさび', answer)).toEqual({ kind: 'length', expected: 7, actual: 3 });
    expect(checkAnswer('くさびがたもち', answer)).toEqual({ kind: 'wrong' });
  });

  it('文字盤は「必要文字＋ダミー文字」で、判明済みの文字は除く', () => {
    const known = [null, null, 'ビ', null, null, null, null];
    const tiles = buildLetterTiles(answer, known, 7, 4);
    expect(tiles).toHaveLength(6 + 4);
    for (const ch of ['ク', 'サ', 'ガ', 'タ', 'モ', 'ジ']) expect(tiles).toContain(ch);
    expect(tiles).not.toContain('ビ');
    expect(buildLetterTiles(answer, known, 7, 4)).toEqual(tiles);
  });
});
