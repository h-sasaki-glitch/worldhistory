import type { HistoryTerm } from '@/history/types';

/**
 * 歴史用語どうしの「関係の種類」。
 *
 * conceptId は「同じ分類に属する」ことしか表さない（例: ハンムラビ法典もローマ法も“法のしくみ”）。
 * 「影響を与えた」「発展した」のような関係は、根拠のあるものだけを HistoricalRelation として別に持つ。
 * こうして「同じ分類」と「直接の影響」を混同しないようにする。
 */
export type RelationType =
  /** 同じ分類（conceptId が同じ）。直接の関係があるとは限らない */
  | 'SAME_CATEGORY'
  /** 似ている点・違う点を比べると理解が深まる */
  | 'COMPARE'
  /** 考え方・しくみが正反対 */
  | 'CONTRAST'
  /** from が to に影響を与えた（向きあり） */
  | 'INFLUENCE'
  /** from がきっかけ・原因となって to が生まれた（向きあり） */
  | 'CAUSE'
  /** 同じころに存在した */
  | 'CONTEMPORARY'
  /** from が発展して to になった（向きあり） */
  | 'EVOLUTION';

export type HistoricalRelation = {
  from: string;
  to: string;
  type: RelationType;
  /** 関係の中身（中学生向けに一文で） */
  note: string;
};

/** 向きのある関係 */
export const DIRECTED_RELATIONS: ReadonlySet<RelationType> = new Set(['INFLUENCE', 'CAUSE', 'EVOLUTION']);

export type RelationDirection = 'out' | 'in' | 'both';

/**
 * 画面に出す短いラベル。一覧の「相手の用語」が、見ている用語にとって何にあたるかを示す。
 * 例: 法家のカードで 秦 →「影響先」、秦のカードで 法家 →「影響元」
 */
export function relationLabel(type: RelationType, direction: RelationDirection): string {
  switch (type) {
    case 'SAME_CATEGORY':
      return '同じ分類';
    case 'COMPARE':
      return '比較';
    case 'CONTRAST':
      return '対照';
    case 'CONTEMPORARY':
      return '同時代';
    case 'INFLUENCE':
      return direction === 'in' ? '影響元' : '影響先';
    case 'CAUSE':
      return direction === 'in' ? '原因' : '結果';
    case 'EVOLUTION':
      return direction === 'in' ? '発展元' : '発展先';
  }
}

export type TermRelation = {
  termId: string;
  type: RelationType;
  direction: RelationDirection;
  label: string;
  note: string;
};

/** termId から見た関係の一覧（明示した HistoricalRelation のみ） */
export function relationsOf(termId: string, relations: readonly HistoricalRelation[]): TermRelation[] {
  const out: TermRelation[] = [];
  for (const r of relations) {
    if (r.from !== termId && r.to !== termId) continue;
    const other = r.from === termId ? r.to : r.from;
    const direction: RelationDirection = DIRECTED_RELATIONS.has(r.type) ? (r.from === termId ? 'out' : 'in') : 'both';
    out.push({ termId: other, type: r.type, direction, label: relationLabel(r.type, direction), note: r.note });
  }
  return out;
}

/** 2 語の間の明示的な関係（なければ undefined） */
export function relationBetween(
  a: string,
  b: string,
  relations: readonly HistoricalRelation[],
): TermRelation | undefined {
  return relationsOf(a, relations).find((r) => r.termId === b);
}

export type AcrossTimeItem = TermRelation & { stageId: string };

/**
 * ACROSS TIME: 別の時代（ステージ）の用語とのつながり。
 * 1. 明示した HistoricalRelation（比較・対照・影響・発展…）を先に並べる
 * 2. 関係を定めていない「同じ conceptId」の用語は SAME_CATEGORY（同じ分類）として後ろに並べる
 *    （分類が同じだけで、影響関係があるとは言わない）
 */
export function acrossTimeOf(
  termId: string,
  termsById: Record<string, HistoryTerm>,
  homeStageOf: Record<string, string>,
  relations: readonly HistoricalRelation[],
  conceptLabel: (conceptId: string) => string,
): AcrossTimeItem[] {
  const term = termsById[termId];
  if (!term) return [];
  const home = homeStageOf[termId];
  const explicit = relationsOf(termId, relations)
    .filter((r) => termsById[r.termId] && homeStageOf[r.termId] !== home)
    .map((r) => ({ ...r, stageId: homeStageOf[r.termId] }));
  const seen = new Set(explicit.map((r) => r.termId));
  const sameCategory: AcrossTimeItem[] = term.conceptId
    ? Object.values(termsById)
        .filter(
          (t) =>
            t.id !== termId && t.conceptId === term.conceptId && homeStageOf[t.id] !== home && !seen.has(t.id),
        )
        .map((t) => ({
          termId: t.id,
          stageId: homeStageOf[t.id],
          type: 'SAME_CATEGORY' as const,
          direction: 'both' as const,
          label: relationLabel('SAME_CATEGORY', 'both'),
          note: `どちらも「${conceptLabel(term.conceptId!)}」に分類される。`,
        }))
    : [];
  return [...explicit, ...sameCategory];
}
