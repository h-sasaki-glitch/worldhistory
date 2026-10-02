import type { HistoryTerm, TermCategory } from '@/history/types';

export const CATEGORY_LABEL_JA: Record<TermCategory, string> = {
  PERSON: '人物',
  PLACE: '地域・場所',
  STATE: '国家・政治',
  EVENT: '出来事',
  IDEA: '思想・制度',
  RELIGION: '宗教・神話',
  TECHNOLOGY: '技術・道具',
  CULTURE: '文化・人々',
  WRITING: '文字・記録',
};

/** DISCOVER LEVEL 1: カテゴリーと地域 */
export function discoverLevel1(term: HistoryTerm): string {
  return `${CATEGORY_LABEL_JA[term.category]} ／ ${term.region}`;
}

/** DISCOVER LEVEL 2: 追加情報 */
export function discoverLevel2(term: HistoryTerm): string {
  return term.discoverNote;
}

/**
 * DISCOVER LEVEL 3: 文字ヒント。おおむね 4 文字に 1 つを伏せる（最低 1 つ）。
 * 伏せる位置は語の中で均等に散らし、毎回同じ結果になる。
 * 例: クサビガタモジ → ク サ ビ _ タ モ ジ
 */
export function letterHint(cells: readonly string[], hiddenMark = '_'): string[] {
  const n = cells.length;
  if (n === 0) return [];
  const hideCount = Math.max(1, Math.floor(n / 4));
  const hidden = new Set<number>();
  for (let k = 0; k < hideCount; k++) {
    hidden.add(Math.min(n - 1, Math.floor(((k + 0.5) * n) / hideCount)));
  }
  return cells.map((ch, i) => (hidden.has(i) ? hiddenMark : ch));
}
