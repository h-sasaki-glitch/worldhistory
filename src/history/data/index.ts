import type { StageDefinition } from '@/history/stage/types';
import type { HistoryTerm } from '@/history/types';

import { EGYPT_STAGE } from './stages/egypt';
import { MESOPOTAMIA_STAGE } from './stages/mesopotamia';
import { EGYPT_TERMS } from './terms/egypt';
import { MESOPOTAMIA_TERMS } from './terms/mesopotamia';

/** 遊べるステージの語彙（ARCHIVE に並ぶ範囲） */
export const ALL_TERMS: HistoryTerm[] = [...MESOPOTAMIA_TERMS];

export const TERMS_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  ALL_TERMS.map((t) => [t.id, t]),
);

export const STAGES: StageDefinition[] = [MESOPOTAMIA_STAGE];

export const STAGES_BY_ID: Record<string, StageDefinition> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
);

/**
 * 制作中（アート未整備）のステージ。データ検証と TIME LINK の確認に使い、画面には出さない。
 */
export const DRAFT_STAGES: StageDefinition[] = [EGYPT_STAGE];

/** 作成済みのすべての語彙（遊べるステージ＋制作中のステージ） */
export const LIBRARY_TERMS: HistoryTerm[] = [...MESOPOTAMIA_TERMS, ...EGYPT_TERMS];

export const LIBRARY_BY_ID: Record<string, HistoryTerm> = Object.fromEntries(
  LIBRARY_TERMS.map((t) => [t.id, t]),
);

/** 語彙の所属ステージ（語彙ファイル単位） */
export const HOME_STAGE_OF: Record<string, string> = Object.fromEntries([
  ...MESOPOTAMIA_TERMS.map((t) => [t.id, MESOPOTAMIA_STAGE.id] as const),
  ...EGYPT_TERMS.map((t) => [t.id, EGYPT_STAGE.id] as const),
]);

export function getTerm(id: string): HistoryTerm {
  const t = TERMS_BY_ID[id];
  if (!t) throw new Error(`Unknown term: ${id}`);
  return t;
}

/** 日本語版 Wikipedia の URL を記事タイトルから生成する */
export function wikipediaUrl(title: string): string {
  return `https://ja.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
