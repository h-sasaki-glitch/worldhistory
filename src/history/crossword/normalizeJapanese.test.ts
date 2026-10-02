import { describe, expect, it } from 'vitest';

import { ALL_TERMS } from '@/history/data';

import {
  hiraganaToKatakana,
  inputToCells,
  isCrosswordAnswer,
  normalizeAnswer,
  toCells,
} from './normalizeJapanese';

describe('Japanese normalization', () => {
  it('漢字の表示名と crosswordAnswer を混同しない', () => {
    expect(() => toCells('楔形文字')).toThrow();
    expect(() => toCells('ハンムラビ王')).toThrow();
    expect(toCells('クサビガタモジ')).toEqual(['ク', 'サ', 'ビ', 'ガ', 'タ', 'モ', 'ジ']);
    expect(inputToCells('都市国家')).toBeNull();
  });

  it('すべての用語データの crosswordAnswer はカタカナのみで、漢字を含む表示名とは別に定義されている', () => {
    for (const t of ALL_TERMS) {
      expect(isCrosswordAnswer(t.crosswordAnswer), t.id).toBe(true);
      expect(normalizeAnswer(t.crosswordAnswer), t.id).toBe(t.crosswordAnswer);
      if (/[一-鿿]/.test(t.display)) expect(t.crosswordAnswer).not.toBe(t.display);
      // 読み（ひらがな）を正規化すると解答の先頭と一致する（「シュメール人」→「シュメール」等）
      expect(normalizeAnswer(t.reading).startsWith(t.crosswordAnswer), t.id).toBe(true);
    }
  });

  it('カタカナ 1 文字単位に分割できる', () => {
    expect(toCells('バビロン')).toEqual(['バ', 'ビ', 'ロ', 'ン']);
  });

  it('小書き文字は 1 セル', () => {
    expect(toCells('ティグリス')).toEqual(['テ', 'ィ', 'グ', 'リ', 'ス']);
    expect(toCells('トシコッカ')).toEqual(['ト', 'シ', 'コ', 'ッ', 'カ']);
    expect(toCells('シュメール')).toHaveLength(5);
  });

  it('長音「ー」は 1 セル', () => {
    expect(toCells('シュメール')).toEqual(['シ', 'ュ', 'メ', 'ー', 'ル']);
    expect(toCells('ユーフラテス')[1]).toBe('ー');
  });

  it('濁音・半濁音は 1 文字 1 セル（結合文字・半角カナも合成する）', () => {
    expect(toCells('メソポタミア')).toEqual(['メ', 'ソ', 'ポ', 'タ', 'ミ', 'ア']);
    expect(toCells('ガ')).toEqual(['ガ']);
    expect(toCells('ﾊﾟ')).toEqual(['パ']);
    expect(toCells('ｼﾞｯｸﾞﾗﾄ')).toEqual(['ジ', 'ッ', 'グ', 'ラ', 'ト']);
  });

  it('中黒を除去する', () => {
    expect(normalizeAnswer('ハンムラビ・ホウテン')).toBe('ハンムラビホウテン');
    expect(normalizeAnswer('ハンムラビ･ホウテン')).toBe('ハンムラビホウテン');
  });

  it('イコール記号・空白などを除去する', () => {
    expect(normalizeAnswer('アッカド=ニホン')).toBe('アッカドニホン');
    expect(normalizeAnswer('アッカド＝ニホン')).toBe('アッカドニホン');
    expect(normalizeAnswer('アッカド゠ニホン')).toBe('アッカドニホン');
    expect(normalizeAnswer(' アッ カド　')).toBe('アッカド');
  });

  it('ひらがな入力をカタカナに変換する', () => {
    expect(hiraganaToKatakana('くさびがたもじ')).toBe('クサビガタモジ');
    expect(inputToCells('てぃぐりす')).toEqual(['テ', 'ィ', 'グ', 'リ', 'ス']);
    expect(normalizeAnswer('しゅめーる')).toBe('シュメール');
  });

  it('横棒類は長音に寄せる', () => {
    expect(normalizeAnswer('シュメ-ル')).toBe('シュメール');
    expect(normalizeAnswer('シュメ－ル')).toBe('シュメール');
  });
});
